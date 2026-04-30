import {BadRequestException, Injectable, NotFoundException} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {DataSource, Repository} from "typeorm"
import {ClientEntity} from "./entities/client.entity"
import {OrderEntity} from "../order/entities/order.entity"
import {ClientAddressEntity} from "../client-address/entities/client-address.entity"
import {FilterAdminClientsDto} from "./dto/filter-admin-clients.dto"
import {UpdateAdminClientDto} from "./dto/update-admin-client.dto"
import {MergeClientsDto} from "./dto/merge-clients.dto"
import {ClientBonusTransactionEntity} from "./entities/client-bonus-transaction.entity"

@Injectable()
export class ClientService {
    constructor(
        private readonly dataSource: DataSource,
        @InjectRepository(ClientEntity)
        private readonly clientRepository: Repository<ClientEntity>,
        @InjectRepository(OrderEntity)
        private readonly orderRepository: Repository<OrderEntity>,
        @InjectRepository(ClientAddressEntity)
        private readonly addressRepository: Repository<ClientAddressEntity>,
        @InjectRepository(ClientBonusTransactionEntity)
        private readonly bonusTransactionRepository: Repository<ClientBonusTransactionEntity>
    ) {}

    private normalizePagination(page?: number, pageSize?: number) {
        const safePage = Number(page) > 0 ? Number(page) : 1
        const safePageSize = Number(pageSize) > 0 ? Math.min(Number(pageSize), 100) : 20
        return {page: safePage, pageSize: safePageSize, skip: (safePage - 1) * safePageSize}
    }

    async findAll(filters: FilterAdminClientsDto = {}) {
        const {page, pageSize, skip} = this.normalizePagination(filters.page, filters.pageSize)
        const query = this.clientRepository
            .createQueryBuilder("client")
            .leftJoin("client.orders", "orders")
            .select("client")
            .addSelect("COUNT(orders.id)", "ordersCount")
            .addSelect("COALESCE(SUM(orders.total), 0)", "totalSpent")
            .addSelect("MAX(orders.createdAt)", "lastOrderAt")
            .groupBy("client.id")

        if (filters.search?.trim()) {
            query.andWhere("(client.name LIKE :search OR client.phone LIKE :search)", {
                search: `%${filters.search.trim()}%`
            })
        }
        if (filters.isActive !== undefined) {
            query.andWhere("client.isActive = :isActive", {isActive: filters.isActive === "true"})
        }

        const total = await query.clone().getCount()
        const {entities, raw} = await query.orderBy("client.id", "DESC").skip(skip).take(pageSize).getRawAndEntities()
        const items = entities.map((client, index) => ({
            ...client,
            ordersCount: Number(raw[index]?.ordersCount || 0),
            totalSpent: Number(raw[index]?.totalSpent || 0),
            lastOrderAt: raw[index]?.lastOrderAt || null
        }))

        return {items, total, page, pageSize}
    }

    async findOne(id: number) {
        const client = await this.clientRepository.findOne({
            where: {id},
            relations: {addresses: true}
        })
        if (!client) throw new NotFoundException("Client not found")

        const stats = await this.orderRepository
            .createQueryBuilder("order")
            .select("COUNT(order.id)", "ordersCount")
            .addSelect("COALESCE(SUM(order.total), 0)", "totalSpent")
            .addSelect("COALESCE(AVG(order.total), 0)", "averageOrderValue")
            .addSelect("MAX(order.createdAt)", "lastOrderAt")
            .where("order.clientId = :id", {id})
            .getRawOne()

        return {
            ...client,
            stats: {
                ordersCount: Number(stats?.ordersCount || 0),
                totalSpent: Number(stats?.totalSpent || 0),
                averageOrderValue: Number(stats?.averageOrderValue || 0),
                lastOrderAt: stats?.lastOrderAt || null
            }
        }
    }

    async update(id: number, dto: UpdateAdminClientDto) {
        const client = await this.clientRepository.findOneBy({id})
        if (!client) throw new NotFoundException("Client not found")
        if (dto.name !== undefined) client.name = dto.name.trim()
        if (dto.phone !== undefined) client.phone = dto.phone.trim()
        if (dto.isActive !== undefined) client.isActive = dto.isActive
        await this.clientRepository.save(client)
        return this.findOne(id)
    }

    async block(id: number) {
        return this.update(id, {isActive: false})
    }

    async unblock(id: number) {
        return this.update(id, {isActive: true})
    }

    async orders(id: number, page = 1, pageSize = 20) {
        await this.findOne(id)
        const {page: safePage, pageSize: safePageSize, skip} = this.normalizePagination(page, pageSize)
        const [items, total] = await this.orderRepository.findAndCount({
            where: {client: {id}},
            relations: {status: true, paymentMethod: true, deliveryType: true, clientAddress: true},
            order: {id: "DESC"},
            skip,
            take: safePageSize
        })
        return {items, total, page: safePage, pageSize: safePageSize}
    }

    async addresses(id: number) {
        await this.findOne(id)
        return this.addressRepository.find({where: {client: {id}}, order: {id: "DESC"}})
    }

    async bonusTransactions(id: number) {
        await this.findOne(id)
        return this.bonusTransactionRepository.find({
            where: {client: {id}},
            relations: {order: true},
            order: {id: "DESC"}
        })
    }

    async merge(dto: MergeClientsDto) {
        if (dto.sourceClientId === dto.targetClientId) {
            throw new BadRequestException("sourceClientId and targetClientId must be different")
        }

        return this.dataSource.transaction(async (manager) => {
            const clientRepository = manager.getRepository(ClientEntity)
            const orderRepository = manager.getRepository(OrderEntity)
            const addressRepository = manager.getRepository(ClientAddressEntity)
            const source = await clientRepository.findOneBy({id: dto.sourceClientId})
            const target = await clientRepository.findOneBy({id: dto.targetClientId})
            if (!source || !target) throw new NotFoundException("Client not found")

            await orderRepository
                .createQueryBuilder()
                .update(OrderEntity)
                .set({client: target})
                .where("clientId = :id", {id: source.id})
                .execute()

            await addressRepository
                .createQueryBuilder()
                .update(ClientAddressEntity)
                .set({client: target})
                .where("clientId = :id", {id: source.id})
                .execute()

            source.isActive = false
            source.phone = source.phone ? `merged:${source.id}:${source.phone}` : null
            await clientRepository.save(source)

            return this.findOne(target.id)
        })
    }
}

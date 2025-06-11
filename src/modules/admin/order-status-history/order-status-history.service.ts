import {Injectable} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {OrderStatusHistoryEntity} from "./entities/order-status-history.entity"
import {CreateOrderStatusHistoryDto} from "./dto/create-order-status-history.dto"
import {UpdateOrderStatusHistoryDto} from "./dto/update-order-status-history.dto"
import {OrderEntity} from "../order/entities/order.entity"
import {OrderStatusEntity} from "../order-status/entities/order-status.entity"

@Injectable()
export class OrderStatusHistoryService {
    constructor(
        @InjectRepository(OrderStatusHistoryEntity)
        private readonly repo: Repository<OrderStatusHistoryEntity>,
        @InjectRepository(OrderEntity)
        private readonly orderRepo: Repository<OrderEntity>,
        @InjectRepository(OrderStatusEntity)
        private readonly statusRepo: Repository<OrderStatusEntity>
    ) {}

    async create(dto: CreateOrderStatusHistoryDto) {
        const order = await this.orderRepo.findOneBy({id: dto.orderId})
        const fromStatus = await this.statusRepo.findOneBy({id: dto.fromStatusId})
        const toStatus = await this.statusRepo.findOneBy({id: dto.toStatusId})

        const entity = this.repo.create({
            order,
            fromStatus,
            toStatus,
            changedBy: dto.changedBy
        })

        return this.repo.save(entity)
    }

    findAll() {
        return this.repo.find({relations: ["order", "fromStatus", "toStatus"]})
    }

    findOne(id: number) {
        return this.repo.findOne({where: {id}, relations: ["order", "fromStatus", "toStatus"]})
    }

    async update(id: number, dto: UpdateOrderStatusHistoryDto) {
        const entity = await this.repo.findOneBy({id})

        if (dto.orderId) {
            entity.order = await this.orderRepo.findOneBy({id: dto.orderId})
        }
        if (dto.fromStatusId) {
            entity.fromStatus = await this.statusRepo.findOneBy({id: dto.fromStatusId})
        }
        if (dto.toStatusId) {
            entity.toStatus = await this.statusRepo.findOneBy({id: dto.toStatusId})
        }
        entity.changedBy = dto.changedBy ?? entity.changedBy

        return this.repo.save(entity)
    }

    remove(id: number) {
        return this.repo.delete(id)
    }
}

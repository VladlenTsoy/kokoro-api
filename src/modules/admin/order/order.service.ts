import {Injectable} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {OrderEntity} from "./entities/order.entity"
import {CreateOrderDto} from "./dto/create-order.dto"
import {UpdateOrderDto} from "./dto/update-order.dto"
import {OrderStatusEntity} from "../order-status/entities/order-status.entity"
import {PaymentMethodEntity} from "../payment-method/entities/payment-method.entity"
import {SourceEntity} from "../source/entities/source.entity"
import {DeliveryTypeEntity} from "../delivery-type/entities/delivery-type.entity"

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(OrderEntity)
        private readonly repo: Repository<OrderEntity>,
        @InjectRepository(OrderStatusEntity)
        private readonly statusRepo: Repository<OrderStatusEntity>,
        @InjectRepository(PaymentMethodEntity)
        private readonly paymentRepo: Repository<PaymentMethodEntity>,
        @InjectRepository(SourceEntity)
        private readonly sourceRepo: Repository<SourceEntity>,
        @InjectRepository(DeliveryTypeEntity)
        private readonly deliveryRepo: Repository<DeliveryTypeEntity>
    ) {}

    async create(dto: CreateOrderDto) {
        const status = await this.statusRepo.findOneBy({id: dto.statusId})
        const paymentMethod = dto.paymentMethodId ? await this.paymentRepo.findOneBy({id: dto.paymentMethodId}) : null
        const source = dto.sourceId ? await this.sourceRepo.findOneBy({id: dto.sourceId}) : null
        const deliveryType = dto.deliveryTypeId ? await this.deliveryRepo.findOneBy({id: dto.deliveryTypeId}) : null

        const entity = this.repo.create({
            ...dto,
            status,
            paymentMethod,
            source,
            deliveryType
        })

        return this.repo.save(entity)
    }

    findAll() {
        return this.repo.find({relations: ["status", "paymentMethod", "source", "deliveryType"]})
    }

    findOne(id: number) {
        return this.repo.findOne({where: {id}, relations: ["status", "paymentMethod", "source", "deliveryType"]})
    }

    async update(id: number, dto: UpdateOrderDto) {
        const updateData: any = {...dto}

        if (dto.statusId) {
            updateData.status = await this.statusRepo.findOneBy({id: dto.statusId})
        }
        if (dto.paymentMethodId !== undefined) {
            updateData.paymentMethod = dto.paymentMethodId
                ? await this.paymentRepo.findOneBy({id: dto.paymentMethodId})
                : null
        }
        if (dto.sourceId !== undefined) {
            updateData.source = dto.sourceId ? await this.sourceRepo.findOneBy({id: dto.sourceId}) : null
        }
        if (dto.deliveryTypeId !== undefined) {
            updateData.deliveryType = dto.deliveryTypeId
                ? await this.deliveryRepo.findOneBy({id: dto.deliveryTypeId})
                : null
        }

        await this.repo.update(id, updateData)
        return this.findOne(id)
    }

    remove(id: number) {
        return this.repo.delete(id)
    }
}

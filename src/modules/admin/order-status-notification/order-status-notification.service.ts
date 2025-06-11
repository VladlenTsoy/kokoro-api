import {Injectable} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {OrderStatusNotificationEntity} from "./entities/order-status-notification.entity"
import {CreateOrderStatusNotificationDto} from "./dto/create-order-status-notification.dto"
import {UpdateOrderStatusNotificationDto} from "./dto/update-order-status-notification.dto"
import {OrderStatusEntity} from "../order-status/entities/order-status.entity"

@Injectable()
export class OrderStatusNotificationService {
    constructor(
        @InjectRepository(OrderStatusNotificationEntity)
        private readonly repo: Repository<OrderStatusNotificationEntity>,
        @InjectRepository(OrderStatusEntity)
        private readonly statusRepo: Repository<OrderStatusEntity>
    ) {}

    async create(dto: CreateOrderStatusNotificationDto) {
        const status = await this.statusRepo.findOneBy({id: dto.statusId})

        const entity = this.repo.create({
            ...dto,
            status
        })

        return this.repo.save(entity)
    }

    findAll() {
        return this.repo.find({relations: ["status"]})
    }

    findOne(id: number) {
        return this.repo.findOne({where: {id}, relations: ["status"]})
    }

    async update(id: number, dto: UpdateOrderStatusNotificationDto) {
        const updateData: any = {...dto}

        if (dto.statusId) {
            const status = await this.statusRepo.findOneBy({id: dto.statusId})
            updateData.status = status
        }

        await this.repo.update(id, updateData)
        return this.findOne(id)
    }

    remove(id: number) {
        return this.repo.delete(id)
    }
}

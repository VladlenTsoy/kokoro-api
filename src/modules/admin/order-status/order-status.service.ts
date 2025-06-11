import {Injectable} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {OrderStatusEntity} from "./entities/order-status.entity"
import {CreateOrderStatusDto} from "./dto/create-order-status.dto"
import {UpdateOrderStatusDto} from "./dto/update-order-status.dto"

@Injectable()
export class OrderStatusService {
    constructor(
        @InjectRepository(OrderStatusEntity)
        private readonly repo: Repository<OrderStatusEntity>
    ) {}

    create(dto: CreateOrderStatusDto) {
        return this.repo.save(dto)
    }

    findAll() {
        return this.repo.find()
    }

    findOne(id: number) {
        return this.repo.findOne({where: {id}})
    }

    update(id: number, dto: UpdateOrderStatusDto) {
        return this.repo.update(id, dto)
    }

    remove(id: number) {
        return this.repo.delete(id)
    }
}

import {Injectable, NotFoundException} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {In, Repository} from "typeorm"
import {OrderStatusEntity} from "./entities/order-status.entity"
import {CreateOrderStatusDto} from "./dto/create-order-status.dto"
import {UpdateOrderStatusDto} from "./dto/update-order-status.dto"
import {OrderStatusTransitionEntity} from "./entities/order-status-transition.entity"
import {SetOrderStatusTransitionsDto} from "./dto/set-order-status-transitions.dto"

@Injectable()
export class OrderStatusService {
    constructor(
        @InjectRepository(OrderStatusEntity)
        private readonly repo: Repository<OrderStatusEntity>,
        @InjectRepository(OrderStatusTransitionEntity)
        private readonly transitionRepo: Repository<OrderStatusTransitionEntity>
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

    getTransitions(id: number) {
        return this.transitionRepo.find({
            where: {fromStatus: {id}, isActive: true},
            relations: {fromStatus: true, toStatus: true},
            order: {id: "ASC"}
        })
    }

    async setTransitions(id: number, dto: SetOrderStatusTransitionsDto) {
        const fromStatus = await this.repo.findOneBy({id})
        if (!fromStatus) throw new NotFoundException("Order status not found")
        const toStatuses = dto.toStatusIds.length ? await this.repo.find({where: {id: In(dto.toStatusIds)}}) : []

        await this.transitionRepo.createQueryBuilder().delete().where("fromStatusId = :id", {id}).execute()
        const transitions = toStatuses.map((toStatus) =>
            this.transitionRepo.create({
                fromStatus,
                toStatus,
                isActive: true
            })
        )
        await this.transitionRepo.save(transitions)

        return this.getTransitions(id)
    }
}

import {Injectable} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {PaymentMethodEntity} from "./entities/payment-method.entity"
import {CreatePaymentMethodDto} from "./dto/create-payment-method.dto"
import {UpdatePaymentMethodDto} from "./dto/update-payment-method.dto"

@Injectable()
export class PaymentMethodService {
    constructor(
        @InjectRepository(PaymentMethodEntity)
        private readonly repo: Repository<PaymentMethodEntity>
    ) {}

    create(dto: CreatePaymentMethodDto) {
        return this.repo.save(dto)
    }

    findAll() {
        return this.repo.find()
    }

    findOne(id: number) {
        return this.repo.findOne({where: {id}})
    }

    update(id: number, dto: UpdatePaymentMethodDto) {
        return this.repo.update(id, dto)
    }

    remove(id: number) {
        return this.repo.delete(id)
    }
}

import {Injectable} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {SalesPointEntity} from "./entities/sales-point.entity"
import {CreateSalesPointDto} from "./dto/create-sales-point.dto"
import {UpdateSalesPointDto} from "./dto/update-sales-point.dto"

@Injectable()
export class SalesPointService {
    constructor(
        @InjectRepository(SalesPointEntity)
        private readonly repo: Repository<SalesPointEntity>
    ) {}

    create(dto: CreateSalesPointDto) {
        return this.repo.save(dto)
    }

    findAll() {
        return this.repo.find()
    }

    findOne(id: number) {
        return this.repo.findOne({where: {id}})
    }

    update(id: number, dto: UpdateSalesPointDto) {
        return this.repo.update(id, dto)
    }

    remove(id: number) {
        return this.repo.delete(id)
    }
}

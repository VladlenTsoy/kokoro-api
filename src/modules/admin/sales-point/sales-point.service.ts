import {Injectable, NotFoundException} from "@nestjs/common"
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

    findAllWithProductStorages() {
        return this.repo.find({
            relations: ["product_storages"],
            order: {id: "ASC"}
        })
    }

    findOne(id: number) {
        return this.repo.findOne({where: {id}})
    }

    async update(id: number, dto: UpdateSalesPointDto) {
        const existing = await this.repo.findOneBy({id})
        if (!existing) throw new NotFoundException("SalesPoint not found")

        const updated = this.repo.merge(existing, dto)
        return this.repo.save(updated)
    }

    remove(id: number) {
        return this.repo.delete(id)
    }
}

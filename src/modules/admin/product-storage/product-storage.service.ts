import {Injectable} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {ProductStorageEntity} from "./entities/product-storage.entity"
import {CreateProductStorageDto} from "./dto/create-product-storage.dto"
import {UpdateProductStorageDto} from "./dto/update-product-storage.dto"
import {SalesPointEntity} from "../sales-point/entities/sales-point.entity"

@Injectable()
export class ProductStorageService {
    constructor(
        @InjectRepository(ProductStorageEntity)
        private readonly repo: Repository<ProductStorageEntity>,
        @InjectRepository(SalesPointEntity)
        private readonly salesPointRepo: Repository<SalesPointEntity>
    ) {}

    async create(dto: CreateProductStorageDto) {
        const salesPoint = await this.salesPointRepo.findOneBy({id: dto.salesPointId})

        const storage = this.repo.create({
            title: dto.title,
            salesPoint
        })

        return this.repo.save(storage)
    }

    findAll() {
        return this.repo.find({relations: ["salesPoint"]})
    }

    findOne(id: number) {
        return this.repo.findOne({where: {id}, relations: ["salesPoint"]})
    }

    async update(id: number, dto: UpdateProductStorageDto) {
        const updateData: Partial<ProductStorageEntity> = {title: dto.title}

        if (dto.salesPointId) {
            const salesPoint = await this.salesPointRepo.findOneBy({id: dto.salesPointId})
            updateData.salesPoint = salesPoint
        }

        await this.repo.update(id, updateData)
        return this.findOne(id)
    }

    remove(id: number) {
        return this.repo.delete(id)
    }
}

import {Injectable} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {ProductVariantMeasurementEntity} from "./entities/product-variant-measurement.entity"
import {CreateProductVariantMeasurementDto} from "./dto/create-product-variant-measurement.dto"
import {UpdateProductVariantMeasurementDto} from "./dto/update-product-variant-measurement.dto"

@Injectable()
export class ProductVariantMeasurementService {
    constructor(
        @InjectRepository(ProductVariantMeasurementEntity)
        private readonly repo: Repository<ProductVariantMeasurementEntity>
    ) {}

    create(dto: CreateProductVariantMeasurementDto) {
        return this.repo.save(dto)
    }

    findAll() {
        return this.repo.find()
    }

    findOne(id: number) {
        return this.repo.findOne({where: {id}})
    }

    update(id: number, dto: UpdateProductVariantMeasurementDto) {
        return this.repo.update(id, dto)
    }

    remove(id: number) {
        return this.repo.delete(id)
    }
}

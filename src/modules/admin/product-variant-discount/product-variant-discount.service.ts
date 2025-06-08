import {Injectable} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {ProductVariantDiscountEntity} from "./entities/product-variant-discount.entity"
import {CreateProductVariantDiscountDto} from "./dto/create-product-variant-discount.dto"
import {UpdateProductVariantDiscountDto} from "./dto/update-product-variant-discount.dto"

@Injectable()
export class ProductVariantDiscountService {
    constructor(
        @InjectRepository(ProductVariantDiscountEntity)
        private readonly repo: Repository<ProductVariantDiscountEntity>
    ) {}

    create(dto: CreateProductVariantDiscountDto) {
        return this.repo.save(dto)
    }

    findAll() {
        return this.repo.find()
    }

    findOne(id: number) {
        return this.repo.findOne({where: {id}})
    }

    update(id: number, dto: UpdateProductVariantDiscountDto) {
        return this.repo.update(id, dto)
    }

    remove(id: number) {
        return this.repo.delete(id)
    }
}

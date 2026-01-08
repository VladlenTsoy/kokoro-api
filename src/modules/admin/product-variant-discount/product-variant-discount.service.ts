import {Injectable} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {ProductVariantDiscountEntity} from "./entities/product-variant-discount.entity"
import {CreateProductVariantDiscountDto} from "./dto/create-product-variant-discount.dto"
import {UpdateProductVariantDiscountDto} from "./dto/update-product-variant-discount.dto"
import {ProductVariantEntity} from "../product-variant/entities/product-variant.entity"

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

    removeByProductVariantId(productVariantId: number) {
        return this.repo.delete({
            productVariant: {
                id: productVariantId
            }
        })
    }

    findOneByProductVariantId(productVariantId: number) {
        return this.repo.findOne({
            where: {
                productVariant: {
                    id: productVariantId
                }
            }
        })
    }

    async createOrUpdateByProductVariant(
        productVariant: ProductVariantEntity,
        discount: {
            discountPercent: number
            endDate?: Date
        }
    ) {
        const selectedDiscount = await this.findOneByProductVariantId(productVariant.id)
        if (selectedDiscount) {
            await this.update(selectedDiscount.id, discount)
        } else {
            await this.create({
                ...discount,
                productVariant: productVariant
            })
        }
    }
}

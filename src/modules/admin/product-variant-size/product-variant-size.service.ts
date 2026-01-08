import {Injectable} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {In, Not, Repository} from "typeorm"
import {ProductVariantSizeEntity} from "./entities/product-variant-size.entity"
import {CreateProductVariantSizeDto} from "./dto/create-product-variant-size.dto"
import {ProductSizeDto} from "../product-variant/dto/create-product-variant.dto"
import {UpdateProductVariantSizeDto} from "./dto/update-product-variant-size.dto"

@Injectable()
export class ProductVariantSizeService {
    constructor(
        @InjectRepository(ProductVariantSizeEntity)
        private readonly productSizeRepository: Repository<ProductVariantSizeEntity>
    ) {}

    async create(createProductSizeDto: CreateProductVariantSizeDto) {
        const productSize = this.productSizeRepository.create(createProductSizeDto)
        // Save product size
        await this.productSizeRepository.save(productSize)

        return productSize
    }

    update(id: number, dto: UpdateProductVariantSizeDto) {
        return this.productSizeRepository.update(id, dto)
    }

    async removeByProductVariantId(productVariantId: number) {
        await this.productSizeRepository.delete({product_variant_id: productVariantId})
    }

    async removeBySizeIdsAndProductVariantId(productVariantId: number, sizeIds) {
        await this.productSizeRepository.delete({
            size_id: Not(In(sizeIds)),
            product_variant_id: productVariantId
        })
    }

    async updateOrDeleteByProductVariantId(productVariantId: number, productSizes: ProductSizeDto[]) {
        const actualSizeIds = productSizes.map((size) => size.size_id)
        await this.removeBySizeIdsAndProductVariantId(productVariantId, actualSizeIds)
        await Promise.all(
            productSizes.map(async (productSize) => {
                if (productSize?.id) {
                    await this.update(productSize.id, {
                        ...productSize,
                        cost_price: productSize.cost_price || 0
                    })
                } else {
                    await this.create({
                        ...productSize,
                        cost_price: productSize.cost_price || 0,
                        product_variant_id: productVariantId
                    })
                }
            })
        )
    }
}

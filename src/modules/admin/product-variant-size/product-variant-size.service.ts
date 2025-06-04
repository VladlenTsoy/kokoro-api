import {Injectable} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {ProductVariantSizeEntity} from "./entities/product-variant-size.entity"
import {CreateProductVariantSizeDto} from "./dto/create-product-variant-size.dto"

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

    async removeByProductColorId(productColorId: number) {
        await this.productSizeRepository.delete({product_color_id: productColorId})
    }
}

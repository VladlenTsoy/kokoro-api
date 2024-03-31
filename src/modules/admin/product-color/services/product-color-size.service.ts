import {Injectable} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {ProductColorSizeEntity} from "../entities/product-color-size.entity"
import {CreateProductSizeDto} from "../dto/create-product-size.dto"

@Injectable()
export class ProductColorSizeService {
    constructor(
        @InjectRepository(ProductColorSizeEntity)
        private readonly productSizeRepository: Repository<ProductColorSizeEntity>
    ) {
    }

    async create(createProductSizeDto: CreateProductSizeDto) {
        const productSize = this.productSizeRepository.create(createProductSizeDto)
        // Save product size
        await this.productSizeRepository.save(productSize)

        return productSize
    }

    async removeByProductColorId(productColorId: number) {
        await this.productSizeRepository.delete({product_color_id: productColorId})
    }
}

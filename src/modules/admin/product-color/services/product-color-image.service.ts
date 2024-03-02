import {Injectable} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {ProductColorImageEntity} from "../entities/product-color-image.entity"
import {Repository} from "typeorm"
import {CreateProductColorImageDto} from "../dto/create-product-color-image.dto"

@Injectable()
export class ProductColorImageService {
    constructor(
        @InjectRepository(ProductColorImageEntity)
        private readonly productColorImageRepository: Repository<ProductColorImageEntity>
    ) {}

    async create(createProductColorImageDto: CreateProductColorImageDto) {
        // Create product color image
        const productColorImage = this.productColorImageRepository.create({
            product_color_id: createProductColorImageDto.product_color_id,
            name: createProductColorImageDto.name,
            size: createProductColorImageDto.size,
            path: createProductColorImageDto.path,
            position: createProductColorImageDto.position
        })
        // Save product color image
        await this.productColorImageRepository.save(productColorImage)
        return productColorImage
    }
}

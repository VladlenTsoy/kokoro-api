import {Injectable} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {ProductVariantImageEntity} from "./entities/product-variant-image.entity"
import {Repository} from "typeorm"
import {CreateProductVariantImageDto} from "./dto/create-product-variant-image.dto"
import {AwsService} from "../aws/aws.service"

@Injectable()
export class ProductVariantImageService {
    constructor(
        @InjectRepository(ProductVariantImageEntity)
        private readonly productColorImageRepository: Repository<ProductVariantImageEntity>,
        private readonly awsService: AwsService
    ) {}

    async create(createProductColorImageDto: CreateProductVariantImageDto) {
        // Create product variant image
        const productColorImage = this.productColorImageRepository.create({
            product_color_id: createProductColorImageDto.product_color_id,
            name: createProductColorImageDto.name,
            size: createProductColorImageDto.size,
            path: createProductColorImageDto.path,
            position: createProductColorImageDto.position
        })
        // Save product variant image
        await this.productColorImageRepository.save(productColorImage)
        return productColorImage
    }

    async removeByProductVariantId(productColorId: number) {
        const productColorImage = await this.productColorImageRepository.findOneBy({product_color_id: productColorId})
        if (productColorImage?.path) await this.awsService.deleteFile(productColorImage.path)
        await this.productColorImageRepository.delete(productColorImage.id)
    }
}

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
        private readonly productVariantImageRepository: Repository<ProductVariantImageEntity>,
        private readonly awsService: AwsService
    ) {}

    async create(createProductVariantImageDto: CreateProductVariantImageDto) {
        // Create product variant image
        const productVariantImage = this.productVariantImageRepository.create({
            product_variant_id: createProductVariantImageDto.product_variant_id,
            name: createProductVariantImageDto.name,
            size: createProductVariantImageDto.size,
            path: createProductVariantImageDto.path,
            position: createProductVariantImageDto.position
        })
        // Save product variant image
        await this.productVariantImageRepository.save(productVariantImage)
        return productVariantImage
    }

    async removeByProductVariantId(productVariantId: number) {
        const productVariantImage = await this.productVariantImageRepository.findOneBy({product_variant_id: productVariantId})
        if (productVariantImage?.path) await this.awsService.deleteFile(productVariantImage.path)
        await this.productVariantImageRepository.delete(productVariantImage.id)
    }
}

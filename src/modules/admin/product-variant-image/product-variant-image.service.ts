import {Injectable} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {ProductColorImageEntity} from "../entities/product-color-image.entity"
import {Repository} from "typeorm"
import {CreateProductColorImageDto} from "../dto/create-product-color-image.dto"
import {AwsService} from "../../aws/aws.service"

@Injectable()
export class ProductVariantImageService {
    constructor(
        @InjectRepository(ProductColorImageEntity)
        private readonly productColorImageRepository: Repository<ProductColorImageEntity>,
        private readonly awsService: AwsService
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

    async removeByProductColorId(productColorId: number) {
        const productColorImage = await this.productColorImageRepository.findOneBy({product_color_id: productColorId})
        if (productColorImage?.path) await this.awsService.deleteFile(productColorImage.path)
        await this.productColorImageRepository.delete(productColorImage.id)
    }
}

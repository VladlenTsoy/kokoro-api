import {Injectable} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {ProductVariantImageEntity} from "./entities/product-variant-image.entity"
import {Repository} from "typeorm"
import {CreateProductVariantImageDto} from "./dto/create-product-variant-image.dto"
import {AwsService} from "../aws/aws.service"
import {ProductImageDto} from "../product-variant/dto/create-product-variant.dto"

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

    async update(id: number, updateProductVariantImageDto: Partial<CreateProductVariantImageDto>) {
        return this.productVariantImageRepository.update(id, {
            ...updateProductVariantImageDto
        })
    }

    remove(id: number) {
        return this.productVariantImageRepository.delete(id)
    }

    async removeByProductVariantId(productVariantId: number) {
        const productVariantImage = await this.productVariantImageRepository.findOneBy({
            product_variant_id: productVariantId
        })
        if (productVariantImage?.path) await this.awsService.deleteFile(productVariantImage.path)
        await this.productVariantImageRepository.delete(productVariantImage.id)
    }

    async updateOrDeleteByVariantId(productVariantId: number, productImages: ProductImageDto[]) {
        const images: ProductImageDto[] = []
        // Move images from tmp folder
        for (const productImage of productImages) {
            // Delete files with marker to_delete
            if (productImage.to_delete) {
                await this.awsService.deleteFile(productImage.path)
                await this.remove(productImage.id)
                continue
            }

            if (productImage.id) {
                images.push({...productImage})
                continue
            }

            // Save files
            const newPath = `kokoro/${productVariantId}/${productImage.name}`
            await this.awsService.moveFile(productImage.path, newPath)

            images.push({...productImage, path: newPath})
        }

        //Create product image
        await Promise.all(
            images.map(async (image, key) => {
                if (image.id) {
                    await this.update(image.id, {
                        position: image.position || key + 1
                    })
                } else {
                    await this.create({
                        ...image,
                        position: image.position || key + 1,
                        product_variant_id: productVariantId
                    })
                }
            })
        )
    }
}

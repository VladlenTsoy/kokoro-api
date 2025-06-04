import {Injectable, NotFoundException} from "@nestjs/common"
import {CreateProductVariantDto} from "./dto/create-product-variant.dto"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {ProductVariantEntity} from "./entities/product-variant.entity"
import {ProductService} from "../product/product.service"
import {ProductVariantSizeService} from "../product-variant-size/product-variant-size.service"
import {ProductVariantImageService} from "../product-variant-image/product-variant-image.service"
import {AwsService} from "../aws/aws.service"
import {UpdateProductVariantDto} from "./dto/update-product-variant.dto"
import {ProductTagService} from "../product-tag/product-tag.service"

@Injectable()
export class ProductVariantService {
    constructor(
        @InjectRepository(ProductVariantEntity)
        private readonly productVariantRepository: Repository<ProductVariantEntity>,
        private readonly productService: ProductService,
        private readonly productSizeService: ProductVariantSizeService,
        private readonly productVariantImageService: ProductVariantImageService,
        private readonly awsService: AwsService,
        private readonly productTagService: ProductTagService
    ) {}

    async create(createProductVariantDto: CreateProductVariantDto) {
        // Select product id
        let productId = createProductVariantDto?.product_id
        const categoryId = createProductVariantDto?.category_id
        const tags = createProductVariantDto?.tags

        // Check product_id, if it doesn't exist, create it
        if (!productId) {
            const product = await this.productService.create({category_id: categoryId})
            productId = product.id
        }

        // Create product variant
        const productVariant = this.productVariantRepository.create({
            title: createProductVariantDto.title,
            price: createProductVariantDto.price,
            product_id: productId,
            color_id: createProductVariantDto.color_id
        })

        // Create product tags
        if (tags?.length) {
            productVariant.tags = await this.productTagService.findByIds(createProductVariantDto.tags)
        }

        // Save product variant
        await this.productVariantRepository.save(productVariant)

        // Create product sizes
        await Promise.all(
            createProductVariantDto.product_sizes.map(async (productSize) => {
                await this.productSizeService.create({
                    ...productSize,
                    product_variant_id: productVariant.id
                })
            })
        )

        // Move images and Create product images
        if (createProductVariantDto.product_images && createProductVariantDto.product_images.length) {
            // Move images from tmp folder
            const images = await Promise.all(
                createProductVariantDto.product_images.map(async (productImage) => {
                    const newPath = `kokoro/${productVariant.id}/${productImage.name}`
                    await this.awsService.moveFile(productImage.path, newPath)

                    return {...productImage, path: newPath}
                })
            )
            //Create product image
            await Promise.all(
                images.map(async (image) => {
                    await this.productVariantImageService.create({
                        ...image,
                        product_variant_id: productVariant.id
                    })
                })
            )
        }

        return productVariant
    }

    findAll(params: {page: number; pageSize: number}) {
        return this.productVariantRepository
            .createQueryBuilder("productVariant")
            .leftJoinAndSelect("productVariant.color", "color")
            .leftJoinAndSelect("productVariant.sizes", "sizes")
            .leftJoinAndSelect("productVariant.images", "images")
            .leftJoinAndSelect("sizes.size", "size")
            .select([
                "productVariant.id",
                "productVariant.title",
                "productVariant.price",
                "color.title",
                "color.hex",
                "sizes.qty",
                "size.title",
                "images.id",
                // "images.path",
                "images.position"
            ])
            .skip((params.page - 1) * params.pageSize)
            .take(params.pageSize)
            .getMany()
    }

    findOne(id: number) {
        return `This action returns a #${id} productVariant`
    }

    update(id: number, updateProductVariantDto: UpdateProductVariantDto) {
        console.log(updateProductVariantDto)
        return `This action updates a #${id} productVariant`
    }

    async remove(id: number) {
        const productVariant = await this.productVariantRepository.findOneBy({id})
        if (!productVariant) throw new NotFoundException("The product variant was not found")
        await this.productSizeService.removeByProductVariantId(id)
        await this.productVariantImageService.removeByProductVariantId(id)
        await this.productVariantRepository.delete(id)
        return {message: "Product variant has been successfully removed"}
    }
}

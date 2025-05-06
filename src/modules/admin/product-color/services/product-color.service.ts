import {Injectable, NotFoundException} from "@nestjs/common"
import {CreateProductColorDto} from "../dto/create-product-color.dto"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {ProductColorEntity} from "../entities/product-color.entity"
import {ProductService} from "./product.service"
import {ProductColorSizeService} from "./product-color-size.service"
import {ProductColorImageService} from "./product-color-image.service"
import {AwsService} from "../../aws/aws.service"

@Injectable()
export class ProductColorService {
    constructor(
        @InjectRepository(ProductColorEntity)
        private readonly productColorRepository: Repository<ProductColorEntity>,
        private readonly productService: ProductService,
        private readonly productSizeService: ProductColorSizeService,
        private readonly productColorImageService: ProductColorImageService,
        private readonly awsService: AwsService
    ) {}

    async create(createProductColorDto: CreateProductColorDto) {
        // Select product id
        let productId = createProductColorDto?.product_id

        // Check product_id, if it doesn't exist, create it
        if (!productId) {
            const product = await this.productService.create()
            productId = product.id
        }

        // Create product color
        const productColor = this.productColorRepository.create({
            title: createProductColorDto.title,
            price: createProductColorDto.price,
            product_id: productId,
            color_id: createProductColorDto.color_id
        })
        // Save product color
        await this.productColorRepository.save(productColor)

        // Create product sizes
        await Promise.all(
            createProductColorDto.product_sizes.map(async (productSize) => {
                await this.productSizeService.create({
                    ...productSize,
                    product_color_id: productColor.id
                })
            })
        )

        // Move images and Create product images
        if (createProductColorDto.product_images && createProductColorDto.product_images.length) {
            // Move images from tmp folder
            const images = await Promise.all(
                createProductColorDto.product_images.map(async (productImage) => {
                    const newPath = `kokoro/${productColor.id}/${productImage.name}`
                    await this.awsService.moveFile(productImage.path, newPath)

                    return {...productImage, path: newPath}
                })
            )
            //Create product image
            await Promise.all(
                images.map(async (image) => {
                    await this.productColorImageService.create({
                        ...image,
                        product_color_id: productColor.id
                    })
                })
            )
        }

        return productColor
    }

    findAll(params: {page: number; pageSize: number}) {
        return this.productColorRepository
            .createQueryBuilder("productColor")
            .leftJoinAndSelect("productColor.color", "color")
            .leftJoinAndSelect("productColor.sizes", "sizes")
            .leftJoinAndSelect("productColor.images", "images")
            .leftJoinAndSelect("sizes.size", "size")
            .select([
                "productColor.id",
                "productColor.title",
                "productColor.price",
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
        return `This action returns a #${id} productColor`
    }

    update(id: number) {
        return `This action updates a #${id} productColor`
    }

    async remove(id: number) {
        const productColor = await this.productColorRepository.findOneBy({id})
        if (!productColor) throw new NotFoundException("The product color was not found")
        await this.productSizeService.removeByProductColorId(id)
        await this.productColorImageService.removeByProductColorId(id)
        await this.productColorRepository.delete(id)
        return {message: "Product color has been successfully removed"}
    }
}

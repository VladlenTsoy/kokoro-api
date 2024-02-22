import {Injectable} from "@nestjs/common"
import {CreateProductColorDto} from "../dto/create-product-color.dto"
import {UpdateProductColorDto} from "../dto/update-product-color.dto"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {ProductColorEntity} from "../entities/product-color.entity"
import {ProductService} from "./product.service"
import {ProductSizeService} from "./product-size.service"

@Injectable()
export class ProductColorService {
    constructor(
        @InjectRepository(ProductColorEntity)
        private readonly productColorRepository: Repository<ProductColorEntity>,
        private readonly productService: ProductService,
        private readonly productSizeService: ProductSizeService
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

        return productColor
    }

    findAll() {
        return this.productColorRepository
            .createQueryBuilder("productColor")
            .leftJoinAndSelect("productColor.color", "color")
            .leftJoinAndSelect("productColor.sizes", "sizes")
            .leftJoinAndSelect("sizes.size", "size")
            .select([
                "productColor.id",
                "productColor.title",
                "productColor.price",
                "color.title",
                "color.hex",
                "sizes.qty",
                "size.title"
            ])
            .getMany()
    }

    findOne(id: number) {
        return `This action returns a #${id} productColor`
    }

    update(id: number, updateProductColorDto: UpdateProductColorDto) {
        return `This action updates a #${id} productColor`
    }
}

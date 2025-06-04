import {Injectable, NotFoundException} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {ProductEntity} from "./entities/product.entity"
import {CreateProductDto} from "./dto/create-product.dto"
import {UpdateProductDto} from "./dto/update-product.dto"
import {ProductPropertyService} from "../product-property/product-property.service"

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(ProductEntity)
        private readonly productRepository: Repository<ProductEntity>,
        private readonly productPropertyService: ProductPropertyService
    ) {}

    /**
     * Error output not found
     * @private
     */
    private errorNotFound() {
        throw new NotFoundException("The product was not found")
    }

    async create(createProductDto: CreateProductDto) {
        const {properties, ...productData} = createProductDto

        const product = this.productRepository.create(productData)

        if (properties?.length) {
            product.properties = await this.productPropertyService.findByIds(properties)
        }

        await this.productRepository.save(product)
        return product
    }

    async update(id: number, updateProductDto: UpdateProductDto) {
        const product = await this.productRepository.findOneBy({id})
        // Not found color
        if (!product) this.errorNotFound()
        // Required fields
        product.category_id = updateProductDto.category_id
        // Save product
        return this.productRepository.save(product)
    }
}

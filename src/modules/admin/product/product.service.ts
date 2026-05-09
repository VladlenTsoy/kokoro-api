import {Injectable, NotFoundException} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {ProductEntity} from "./entities/product.entity"
import {CreateProductDto} from "./dto/create-product.dto"
import {UpdateProductDto} from "./dto/update-product.dto"
import {ProductPropertyService} from "../product-property/product-property.service"
import {IntegrationService} from "../integration/integration.service"
import {IntegrationProviderKey} from "../integration/entities/integration-setting.entity"

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(ProductEntity)
        private readonly productRepository: Repository<ProductEntity>,
        private readonly productPropertyService: ProductPropertyService,
        private readonly integrationService: IntegrationService
    ) {}

    /**
     * Error output not found
     * @private
     */
    private errorNotFound() {
        throw new NotFoundException("The product was not found")
    }

    private buildProductIntegrationPayload(product: ProductEntity, eventName: string) {
        return {
            eventId: `${eventName}-kokoro-product-${product.id}`,
            idempotencyKey: `${eventName}-kokoro-product-${product.id}-${Date.now()}`,
            externalId: `kokoro-product-${product.id}`,
            productId: product.id,
            categoryExternalId: product.category_id ? `kokoro-category-${product.category_id}` : null,
            categoryId: product.category_id,
            createdAt: product.created_at
        }
    }

    private async enqueueDatraProductEvent(product: ProductEntity, eventName: string) {
        await this.integrationService.enqueue(
            IntegrationProviderKey.DATRA_CDP,
            eventName,
            this.buildProductIntegrationPayload(product, eventName)
        )
    }

    async create(createProductDto: CreateProductDto) {
        const {properties, ...productData} = createProductDto

        const product = this.productRepository.create(productData)

        if (properties?.length) {
            product.properties = await this.productPropertyService.findByIds(properties)
        }

        await this.productRepository.save(product)
        await this.enqueueDatraProductEvent(product, "product_created")
        return product
    }

    async update(id: number, updateProductDto: UpdateProductDto) {
        const product = await this.productRepository.findOneBy({id})
        // Not found color
        if (!product) this.errorNotFound()
        // Required fields
        if (updateProductDto.category_id !== undefined) {
            product.category_id = updateProductDto.category_id
        }
        // Save product
        const saved = await this.productRepository.save(product)
        await this.enqueueDatraProductEvent(saved, "product_updated")
        return saved
    }

    async removeById(id: number) {
        return await this.productRepository.delete({id})
    }
}

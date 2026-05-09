import {Injectable, NotFoundException} from "@nestjs/common"
import {CreateProductCategoryDto} from "./dto/create-product-category.dto"
import {UpdateProductCategoryDto} from "./dto/update-product-category.dto"
import {InjectRepository} from "@nestjs/typeorm"
import {IsNull, Repository} from "typeorm"
import {ProductCategoryEntity} from "./entities/product-category.entity"
import {IntegrationService} from "../integration/integration.service"
import {IntegrationProviderKey} from "../integration/entities/integration-setting.entity"

@Injectable()
export class ProductCategoryService {
    constructor(
        @InjectRepository(ProductCategoryEntity)
        private readonly productCategoryRepository: Repository<ProductCategoryEntity>,
        private readonly integrationService: IntegrationService
    ) {}

    /**
     * Error output not found
     * @private
     */
    private errorNotFound() {
        throw new NotFoundException("The product category was not found")
    }

    private buildCategoryIntegrationPayload(category: ProductCategoryEntity, eventName: string) {
        return {
            eventId: `${eventName}-kokoro-category-${category.id}`,
            idempotencyKey: `${eventName}-kokoro-category-${category.id}-${Date.now()}`,
            externalId: `kokoro-category-${category.id}`,
            categoryId: category.id,
            title: category.title,
            url: category.url,
            parentExternalId: category.parent_category_id ? `kokoro-category-${category.parent_category_id}` : null,
            parentCategoryId: category.parent_category_id,
            hidden: category.is_hide,
            createdAt: category.created_at
        }
    }

    private async enqueueDatraCategoryEvent(category: ProductCategoryEntity, eventName: string) {
        await this.integrationService.enqueue(
            IntegrationProviderKey.DATRA_CDP,
            eventName,
            this.buildCategoryIntegrationPayload(category, eventName)
        )
    }

    async create(createProductCategoryDto: CreateProductCategoryDto) {
        const productCategory = this.productCategoryRepository.create(createProductCategoryDto)
        // Save product property
        await this.productCategoryRepository.save(productCategory)
        await this.enqueueDatraCategoryEvent(productCategory, "category_created")
        return productCategory
    }

    findAll() {
        return this.productCategoryRepository.find()
    }

    findAllWithSubCategories() {
        return this.productCategoryRepository.find({
            where: {parent: IsNull()},
            relations: ["sub_categories", "sub_categories.sub_categories"],
            order: {id: "ASC"}
        })
    }

    async findOne(id: number) {
        const productCategory = await this.productCategoryRepository.findOneBy({id})
        // Not found product category
        if (!productCategory) this.errorNotFound()

        return productCategory
    }

    async update(id: number, updateProductCategoryDto: UpdateProductCategoryDto) {
        const productCategory = await this.productCategoryRepository.findOneBy({id})
        // Not found product category
        if (!productCategory) this.errorNotFound()
        // Required fields
        productCategory.title = updateProductCategoryDto.title
        productCategory.parent_category_id = updateProductCategoryDto.parent_category_id
        productCategory.url = updateProductCategoryDto.url
        productCategory.is_hide = updateProductCategoryDto.is_hide

        const saved = await this.productCategoryRepository.save(productCategory)
        await this.enqueueDatraCategoryEvent(saved, "category_updated")
        return saved
    }

    async remove(id: number) {
        const productCategory = await this.productCategoryRepository.findOneBy({id})
        // Not found product category
        if (!productCategory) this.errorNotFound()
        // Save
        await this.productCategoryRepository.delete(id)
        // Success message
        return {message: "Product category has been successfully removed"}
    }
}

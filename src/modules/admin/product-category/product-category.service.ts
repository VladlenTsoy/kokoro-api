import {Injectable, NotFoundException} from "@nestjs/common"
import {CreateProductCategoryDto} from "./dto/create-product-category.dto"
import {UpdateProductCategoryDto} from "./dto/update-product-category.dto"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {ProductCategoryEntity} from "./entities/product-category.entity"

@Injectable()
export class ProductCategoryService {
    constructor(
        @InjectRepository(ProductCategoryEntity)
        private readonly productCategoryRepository: Repository<ProductCategoryEntity>
    ) {}

    /**
     * Error output not found
     * @private
     */
    private errorNotFound() {
        throw new NotFoundException("The product category was not found")
    }

    async create(createProductCategoryDto: CreateProductCategoryDto) {
        const productCategory = this.productCategoryRepository.create(createProductCategoryDto)
        // Save product property
        await this.productCategoryRepository.save(productCategory)
        return productCategory
    }

    findAll() {
        return this.productCategoryRepository.find()
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

        return await this.productCategoryRepository.save(productCategory)
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

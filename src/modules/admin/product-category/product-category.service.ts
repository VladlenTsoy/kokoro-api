import {Injectable, NotFoundException} from "@nestjs/common"
import {CreateProductCategoryDto} from "./dto/create-product-category.dto"
import {UpdateProductCategoryDto} from "./dto/update-product-category.dto"
import {InjectRepository} from "@nestjs/typeorm"
import {ProductCategoryEntity} from "./entities/product-category.entity"
import {Repository} from "typeorm"

@Injectable()
export class ProductCategoryService {
    constructor(
        @InjectRepository(ProductCategoryEntity)
        private productCategoryRepository: Repository<ProductCategoryEntity>
    ) {
    }

    /**
     * Error output not found
     * @private
     */
    private errorNotFound() {
        throw new NotFoundException("The product category was not found")
    }

    async create(createProductCategoryDto: CreateProductCategoryDto) {
        const productCategory = this.productCategoryRepository.create(createProductCategoryDto)
        // Save product category
        await this.productCategoryRepository.save(productCategory)
        return productCategory
    }

    findAll() {
        return this.productCategoryRepository.find()
    }

    async findOne(id: number) {
        const productCategory = await this.productCategoryRepository.findOneBy({id})
        // Not found product category
        if(!productCategory) this.errorNotFound()

        return productCategory
    }

    async update(id: number, updateProductCategoryDto: UpdateProductCategoryDto) {
        const productCategory = await this.productCategoryRepository.findOneBy({id})
        // Not found product category
        if (!productCategory) this.errorNotFound()
        // Required field
        productCategory.title = updateProductCategoryDto.title
        // Not required field
        if (updateProductCategoryDto.parent_category_id)
            productCategory.parent_category_id = updateProductCategoryDto.parent_category_id
        if (updateProductCategoryDto.is_hide)
            productCategory.is_hide = updateProductCategoryDto.is_hide

        return await this.productCategoryRepository.save(productCategory)
    }

    async remove(id: number) {
        const productCategory = await this.productCategoryRepository.delete(id)
        // Not found product category
        if (!productCategory.affected) this.errorNotFound()
        // Success message
        return {message: "Product category has been successfully removed"}
    }
}

import {Injectable, NotFoundException} from "@nestjs/common"
import {CreateProductPropertyDto} from "./dto/create-product-property.dto"
import {UpdateProductPropertyDto} from "./dto/update-product-property.dto"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {ProductPropertyEntity} from "./entities/product-property.entity"

@Injectable()
export class ProductPropertyService {
    constructor(
        @InjectRepository(ProductPropertyEntity)
        private readonly productPropertyRepository: Repository<ProductPropertyEntity>
    ) {}

    /**
     * Error output not found
     * @private
     */
    private errorNotFound() {
        throw new NotFoundException("The product property was not found")
    }

    async create(createProductPropertyDto: CreateProductPropertyDto) {
        const productProperty = this.productPropertyRepository.create(createProductPropertyDto)
        // Save product property
        await this.productPropertyRepository.save(productProperty)
        return productProperty
    }

    findAll() {
        return this.productPropertyRepository.find()
    }

    async findOne(id: number) {
        const productProperty = await this.productPropertyRepository.findOneBy({id})
        // Not found product property
        if (!productProperty) this.errorNotFound()

        return productProperty
    }

    async update(id: number, updateProductPropertyDto: UpdateProductPropertyDto) {
        const productProperty = await this.productPropertyRepository.findOneBy({id})
        // Not found product property
        if (!productProperty) this.errorNotFound()
        // Required fields
        productProperty.title = updateProductPropertyDto.title
        productProperty.description = updateProductPropertyDto.description
        productProperty.is_global = updateProductPropertyDto.is_global

        return await this.productPropertyRepository.save(productProperty)
    }

    async remove(id: number) {
        const productProperty = await this.productPropertyRepository.findOneBy({id})
        // Not found color
        if (!productProperty) this.errorNotFound()
        // Save
        await this.productPropertyRepository.delete(id)
        // Success message
        return {message: "Product property has been successfully removed"}
    }
}

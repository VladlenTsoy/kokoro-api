import {Injectable, NotFoundException} from "@nestjs/common"
import {CreateProductTagDto} from "./dto/create-product-tag.dto"
import {UpdateProductTagDto} from "./dto/update-product-tag.dto"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {ProductTagEntity} from "./entities/product-tag.entity"

@Injectable()
export class ProductTagService {
    constructor(
        @InjectRepository(ProductTagEntity)
        private readonly productColorTagRepository: Repository<ProductTagEntity>
    ) {}

    /**
     * Error output not found
     * @private
     */
    private errorNotFound() {
        throw new NotFoundException("The product color tag was not found")
    }

    async create(createProductColorTagDto: CreateProductTagDto) {
        const productColorTag = this.productColorTagRepository.create(createProductColorTagDto)
        // Save product color tag
        await this.productColorTagRepository.save(productColorTag)
        return productColorTag
    }

    findAll() {
        return this.productColorTagRepository.find()
    }

    async findOne(id: number) {
        const productColorTag = await this.productColorTagRepository.findOneBy({id})
        // Not found product color tag
        if (!productColorTag) this.errorNotFound()

        return productColorTag
    }

    async update(id: number, updateProductColorTagDto: UpdateProductTagDto) {
        const productColorTag = await this.productColorTagRepository.findOneBy({id})
        // Not found product color tag
        if (!productColorTag) this.errorNotFound()
        // Required fields
        productColorTag.title = updateProductColorTagDto.title

        return await this.productColorTagRepository.save(productColorTag)
    }

    async remove(id: number) {
        const productColorTag = await this.productColorTagRepository.findOneBy({id})
        // Not found product color tag
        if (!productColorTag) this.errorNotFound()
        await this.productColorTagRepository.delete(id)
        // Success message
        return {message: "Product color tag has been successfully removed"}
    }
}

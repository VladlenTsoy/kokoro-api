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
        private readonly productTagRepository: Repository<ProductTagEntity>
    ) {}

    /**
     * Error output not found
     * @private
     */
    private errorNotFound() {
        throw new NotFoundException("The product tag was not found")
    }

    async create(createProductTagDto: CreateProductTagDto) {
        const productTag = this.productTagRepository.create(createProductTagDto)
        // Save product tag
        await this.productTagRepository.save(productTag)
        return productTag
    }

    findAll() {
        return this.productTagRepository.find()
    }

    async findOne(id: number) {
        const productTag = await this.productTagRepository.findOneBy({id})
        // Not found product tag
        if (!productTag) this.errorNotFound()

        return productTag
    }

    async update(id: number, updateProductTagDto: UpdateProductTagDto) {
        const productTag = await this.productTagRepository.findOneBy({id})
        // Not found product tag
        if (!productTag) this.errorNotFound()
        // Required fields
        productTag.title = updateProductTagDto.title

        return await this.productTagRepository.save(productTag)
    }

    async remove(id: number) {
        const productTag = await this.productTagRepository.findOneBy({id})
        // Not found product tag
        if (!productTag) this.errorNotFound()
        await this.productTagRepository.delete(id)
        // Success message
        return {message: "Product tag has been successfully removed"}
    }
}

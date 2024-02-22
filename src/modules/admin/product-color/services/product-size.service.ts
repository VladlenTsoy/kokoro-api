import {Injectable} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {ProductSizeEntity} from "../entities/product-size.entity"
import {CreateProductSizeDto} from "../dto/create-product-size.dto"

@Injectable()
export class ProductSizeService {
    constructor(
        @InjectRepository(ProductSizeEntity)
        private readonly productSizeRepository: Repository<ProductSizeEntity>
    ) {}

    async create(createProductSizeDto: CreateProductSizeDto) {
        const productSize =
            this.productSizeRepository.create(createProductSizeDto)
        // Save product size
        await this.productSizeRepository.save(productSize)

        return productSize
    }
}

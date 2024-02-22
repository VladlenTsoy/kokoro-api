import {Injectable} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {ProductEntity} from "../entities/product.entity"

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(ProductEntity)
        private readonly productRepository: Repository<ProductEntity>
    ) {}

    async create() {
        const product = this.productRepository.create()
        // Save product
        await this.productRepository.save(product)
        return product
    }
}

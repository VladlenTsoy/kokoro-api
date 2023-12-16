import {Injectable} from "@nestjs/common"
import {ProductCategoryEntity} from "./modules/product-category/entities/product-category.entity"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"

@Injectable()
export class AppService {
    constructor(
        @InjectRepository(ProductCategoryEntity)
        private categoryRepository: Repository<ProductCategoryEntity>
    ) {
    }

    async getHello(): Promise<string> {
        const category = this.categoryRepository.create({title: "Верхняя одежда"})
        await this.categoryRepository.save(category)
        console.log(category)
        return category.url
    }
}

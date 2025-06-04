import {Module} from "@nestjs/common"
import {ProductCategoryService} from "./product-category.service"
import {TypeOrmModule} from "@nestjs/typeorm"
import {ProductCategoryEntity} from "./entities/product-category.entity"

@Module({
    imports: [TypeOrmModule.forFeature([ProductCategoryEntity])],
    providers: [ProductCategoryService]
})
export class ProductCategoryModule {}

import {Module} from "@nestjs/common"
import {ProductCategoryService} from "./product-category.service"
import {TypeOrmModule} from "@nestjs/typeorm"
import {ProductCategoryEntity} from "./entities/product-category.entity"
import {ProductCategoryController} from "./product-category.controller"
import {IntegrationModule} from "../integration/integration.module"

@Module({
    imports: [TypeOrmModule.forFeature([ProductCategoryEntity]), IntegrationModule],
    controllers: [ProductCategoryController],
    providers: [ProductCategoryService]
})
export class ProductCategoryModule {}

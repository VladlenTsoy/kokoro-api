import {Module} from "@nestjs/common"
import {TypeOrmModule} from "@nestjs/typeorm"
import {ProductCategoryEntity} from "../../admin/product-category/entities/product-category.entity"
import {ClientProductCategoryController} from "./product-category.controller"
import {ClientProductCategoryService} from "./product-category.service"

@Module({
    imports: [TypeOrmModule.forFeature([ProductCategoryEntity])],
    controllers: [ClientProductCategoryController],
    providers: [ClientProductCategoryService]
})
export class ClientProductCategoryModule {}

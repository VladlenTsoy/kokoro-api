import {Module} from "@nestjs/common"
import {TypeOrmModule} from "@nestjs/typeorm"
import {ProductCategoryEntity} from "../../admin/product-category/entities/product-category.entity"
import {ClientProductCategoryController} from "./product-category.controller"
import {ClientProductCategoryService} from "./product-category.service"
import {ProductVariantEntity} from "../../admin/product-variant/entities/product-variant.entity"

@Module({
    imports: [TypeOrmModule.forFeature([ProductCategoryEntity, ProductVariantEntity])],
    controllers: [ClientProductCategoryController],
    providers: [ClientProductCategoryService]
})
export class ClientProductCategoryModule {}

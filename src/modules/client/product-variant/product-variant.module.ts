import {Module} from "@nestjs/common"
import {TypeOrmModule} from "@nestjs/typeorm"
import {ProductVariantEntity} from "../../admin/product-variant/entities/product-variant.entity"
import {ClientProductVariantController} from "./product-variant.controller"
import {ClientProductVariantService} from "./product-variant.service"
import {ProductCategoryEntity} from "../../admin/product-category/entities/product-category.entity"
import {OrderItemEntity} from "../../admin/order-item/entities/order-item.entity"

@Module({
    imports: [TypeOrmModule.forFeature([ProductVariantEntity, ProductCategoryEntity, OrderItemEntity])],
    controllers: [ClientProductVariantController],
    providers: [ClientProductVariantService]
})
export class ClientProductVariantModule {}

import {Module} from "@nestjs/common"
import {TypeOrmModule} from "@nestjs/typeorm"
import {OrderItemService} from "./order-item.service"
import {OrderItemController} from "./order-item.controller"
import {OrderItemEntity} from "./entities/order-item.entity"
import {OrderEntity} from "../order/entities/order.entity"
import {ProductVariantEntity} from "../product-variant/entities/product-variant.entity"
import {ProductVariantSizeEntity} from "../product-variant-size/entities/product-variant-size.entity"

@Module({
    imports: [TypeOrmModule.forFeature([OrderItemEntity, OrderEntity, ProductVariantEntity, ProductVariantSizeEntity])],
    controllers: [OrderItemController],
    providers: [OrderItemService],
    exports: [OrderItemService]
})
export class OrderItemModule {}

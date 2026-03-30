import {Module} from "@nestjs/common"
import {TypeOrmModule} from "@nestjs/typeorm"
import {ClientOrderController} from "./order.controller"
import {ClientOrderService} from "./order.service"
import {ClientEntity} from "../../admin/client/entities/client.entity"
import {ClientAddressEntity} from "../../admin/client-address/entities/client-address.entity"
import {OrderEntity} from "../../admin/order/entities/order.entity"
import {OrderItemEntity} from "../../admin/order-item/entities/order-item.entity"
import {OrderStatusEntity} from "../../admin/order-status/entities/order-status.entity"
import {PaymentMethodEntity} from "../../admin/payment-method/entities/payment-method.entity"
import {SourceEntity} from "../../admin/source/entities/source.entity"
import {DeliveryTypeEntity} from "../../admin/delivery-type/entities/delivery-type.entity"
import {ProductVariantEntity} from "../../admin/product-variant/entities/product-variant.entity"

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ClientEntity,
            ClientAddressEntity,
            OrderEntity,
            OrderItemEntity,
            OrderStatusEntity,
            PaymentMethodEntity,
            SourceEntity,
            DeliveryTypeEntity,
            ProductVariantEntity
        ])
    ],
    controllers: [ClientOrderController],
    providers: [ClientOrderService]
})
export class ClientOrderModule {}

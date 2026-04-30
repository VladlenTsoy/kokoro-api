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
import {ClientAuthModule} from "../auth/client-auth.module"
import {ClientOptionalAuthGuard} from "../auth/guards/client-optional-auth.guard"
import {OrderStatusHistoryEntity} from "../../admin/order-status-history/entities/order-status-history.entity"
import {ProductVariantSizeEntity} from "../../admin/product-variant-size/entities/product-variant-size.entity"
import {PromoCodeEntity} from "../../admin/promo-code/entities/promo-code.entity"
import {ClientBonusTransactionEntity} from "../../admin/client/entities/client-bonus-transaction.entity"
import {PaymeModule} from "../../payme/payme.module"

@Module({
    imports: [
        ClientAuthModule,
        PaymeModule,
        TypeOrmModule.forFeature([
            ClientEntity,
            ClientAddressEntity,
            OrderEntity,
            OrderItemEntity,
            OrderStatusEntity,
            PaymentMethodEntity,
            SourceEntity,
            DeliveryTypeEntity,
            ProductVariantEntity,
            OrderStatusHistoryEntity,
            ProductVariantSizeEntity,
            PromoCodeEntity,
            ClientBonusTransactionEntity
        ])
    ],
    controllers: [ClientOrderController],
    providers: [ClientOrderService, ClientOptionalAuthGuard]
})
export class ClientOrderModule {}

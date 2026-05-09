import {Module} from "@nestjs/common"
import {TypeOrmModule} from "@nestjs/typeorm"
import {OrderService} from "./order.service"
import {OrderController} from "./order.controller"
import {AdminOrderController} from "./admin-order.controller"
import {OrderEntity} from "./entities/order.entity"
import {OrderStatusEntity} from "../order-status/entities/order-status.entity"
import {PaymentMethodEntity} from "../payment-method/entities/payment-method.entity"
import {SourceEntity} from "../source/entities/source.entity"
import {DeliveryTypeEntity} from "../delivery-type/entities/delivery-type.entity"
import {ClientEntity} from "../client/entities/client.entity"
import {ClientAddressEntity} from "../client-address/entities/client-address.entity"
import {OrderItemEntity} from "../order-item/entities/order-item.entity"
import {OrderStatusHistoryEntity} from "../order-status-history/entities/order-status-history.entity"
import {OrderCommentEntity} from "./entities/order-comment.entity"
import {EmployeeEntity} from "../employee/entities/employee.entity"
import {OrderStatusTransitionEntity} from "../order-status/entities/order-status-transition.entity"
import {OrderStatusNotificationModule} from "../order-status-notification/order-status-notification.module"
import {ProductVariantSizeEntity} from "../product-variant-size/entities/product-variant-size.entity"
import {ClientBonusTransactionEntity} from "../client/entities/client-bonus-transaction.entity"
import {IntegrationModule} from "../integration/integration.module"

@Module({
    imports: [
        OrderStatusNotificationModule,
        IntegrationModule,
        TypeOrmModule.forFeature([
            OrderEntity,
            OrderStatusEntity,
            PaymentMethodEntity,
            SourceEntity,
            DeliveryTypeEntity,
            ClientEntity,
            ClientAddressEntity,
            OrderItemEntity,
            OrderStatusHistoryEntity,
            OrderCommentEntity,
            EmployeeEntity,
            OrderStatusTransitionEntity,
            ProductVariantSizeEntity,
            ClientBonusTransactionEntity
        ])
    ],
    controllers: [OrderController, AdminOrderController],
    providers: [OrderService],
    exports: [OrderService]
})
export class OrderModule {}

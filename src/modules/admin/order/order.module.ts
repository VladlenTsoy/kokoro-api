import {Module} from "@nestjs/common"
import {TypeOrmModule} from "@nestjs/typeorm"
import {OrderService} from "./order.service"
import {OrderController} from "./order.controller"
import {OrderEntity} from "./entities/order.entity"
import {OrderStatusEntity} from "../order-status/entities/order-status.entity"
import {PaymentMethodEntity} from "../payment-method/entities/payment-method.entity"
import {SourceEntity} from "../source/entities/source.entity"
import {DeliveryTypeEntity} from "../delivery-type/entities/delivery-type.entity"

@Module({
    imports: [
        TypeOrmModule.forFeature([
            OrderEntity,
            OrderStatusEntity,
            PaymentMethodEntity,
            SourceEntity,
            DeliveryTypeEntity
        ])
    ],
    controllers: [OrderController],
    providers: [OrderService],
    exports: [OrderService]
})
export class OrderModule {}

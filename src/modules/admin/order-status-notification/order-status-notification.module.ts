import {Module} from "@nestjs/common"
import {TypeOrmModule} from "@nestjs/typeorm"
import {OrderStatusNotificationService} from "./order-status-notification.service"
import {OrderStatusNotificationController} from "./order-status-notification.controller"
import {OrderStatusNotificationEntity} from "./entities/order-status-notification.entity"
import {OrderNotificationLogEntity} from "./entities/order-notification-log.entity"
import {OrderStatusEntity} from "../order-status/entities/order-status.entity"
import {OrderEntity} from "../order/entities/order.entity"

@Module({
    imports: [TypeOrmModule.forFeature([OrderStatusNotificationEntity, OrderNotificationLogEntity, OrderStatusEntity, OrderEntity])],
    controllers: [OrderStatusNotificationController],
    providers: [OrderStatusNotificationService],
    exports: [OrderStatusNotificationService]
})
export class OrderStatusNotificationModule {}

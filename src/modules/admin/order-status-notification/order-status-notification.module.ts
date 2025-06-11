import {Module} from "@nestjs/common"
import {TypeOrmModule} from "@nestjs/typeorm"
import {OrderStatusNotificationService} from "./order-status-notification.service"
import {OrderStatusNotificationController} from "./order-status-notification.controller"
import {OrderStatusNotificationEntity} from "./entities/order-status-notification.entity"
import {OrderStatusEntity} from "../order-status/entities/order-status.entity"

@Module({
    imports: [TypeOrmModule.forFeature([OrderStatusNotificationEntity, OrderStatusEntity])],
    controllers: [OrderStatusNotificationController],
    providers: [OrderStatusNotificationService],
    exports: [OrderStatusNotificationService]
})
export class OrderStatusNotificationModule {}

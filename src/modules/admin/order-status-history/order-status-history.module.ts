import {Module} from "@nestjs/common"
import {TypeOrmModule} from "@nestjs/typeorm"
import {OrderStatusHistoryService} from "./order-status-history.service"
import {OrderStatusHistoryController} from "./order-status-history.controller"
import {OrderStatusHistoryEntity} from "./entities/order-status-history.entity"
import {OrderEntity} from "../order/entities/order.entity"
import {OrderStatusEntity} from "../order-status/entities/order-status.entity"

@Module({
    imports: [TypeOrmModule.forFeature([OrderStatusHistoryEntity, OrderEntity, OrderStatusEntity])],
    controllers: [OrderStatusHistoryController],
    providers: [OrderStatusHistoryService],
    exports: [OrderStatusHistoryService]
})
export class OrderStatusHistoryModule {}

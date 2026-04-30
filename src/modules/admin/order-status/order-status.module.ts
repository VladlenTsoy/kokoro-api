import {Module} from "@nestjs/common"
import {TypeOrmModule} from "@nestjs/typeorm"
import {OrderStatusService} from "./order-status.service"
import {OrderStatusController} from "./order-status.controller"
import {OrderStatusEntity} from "./entities/order-status.entity"
import {OrderStatusTransitionEntity} from "./entities/order-status-transition.entity"

@Module({
    imports: [TypeOrmModule.forFeature([OrderStatusEntity, OrderStatusTransitionEntity])],
    controllers: [OrderStatusController],
    providers: [OrderStatusService],
    exports: [OrderStatusService]
})
export class OrderStatusModule {}

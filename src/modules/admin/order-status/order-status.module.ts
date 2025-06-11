import {Module} from "@nestjs/common"
import {TypeOrmModule} from "@nestjs/typeorm"
import {OrderStatusService} from "./order-status.service"
import {OrderStatusController} from "./order-status.controller"
import {OrderStatusEntity} from "./entities/order-status.entity"

@Module({
    imports: [TypeOrmModule.forFeature([OrderStatusEntity])],
    controllers: [OrderStatusController],
    providers: [OrderStatusService],
    exports: [OrderStatusService]
})
export class OrderStatusModule {}

import {Module} from "@nestjs/common"
import {TypeOrmModule} from "@nestjs/typeorm"
import {PaymeController} from "./payme.controller"
import {PaymeService} from "./payme.service"
import {OrderEntity} from "../admin/order/entities/order.entity"
import {PaymeTransactionEntity} from "./entities/payme-transaction.entity"

@Module({
    imports: [TypeOrmModule.forFeature([OrderEntity, PaymeTransactionEntity])],
    controllers: [PaymeController],
    providers: [PaymeService],
    exports: [PaymeService]
})
export class PaymeModule {}

import {Module} from "@nestjs/common"
import {TypeOrmModule} from "@nestjs/typeorm"
import {ClientController} from "./client.controller"
import {ClientService} from "./client.service"
import {ClientEntity} from "./entities/client.entity"
import {OrderEntity} from "../order/entities/order.entity"
import {ClientAddressEntity} from "../client-address/entities/client-address.entity"
import {ClientBonusTransactionEntity} from "./entities/client-bonus-transaction.entity"

@Module({
    imports: [TypeOrmModule.forFeature([ClientEntity, OrderEntity, ClientAddressEntity, ClientBonusTransactionEntity])],
    controllers: [ClientController],
    providers: [ClientService],
    exports: [ClientService]
})
export class AdminClientModule {}

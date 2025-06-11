import {Module} from "@nestjs/common"
import {TypeOrmModule} from "@nestjs/typeorm"
import {DeliveryTypeService} from "./delivery-type.service"
import {DeliveryTypeController} from "./delivery-type.controller"
import {DeliveryTypeEntity} from "./entities/delivery-type.entity"
import {CityEntity} from "../city/entities/city.entity"

@Module({
    imports: [TypeOrmModule.forFeature([DeliveryTypeEntity, CityEntity])],
    controllers: [DeliveryTypeController],
    providers: [DeliveryTypeService],
    exports: [DeliveryTypeService]
})
export class DeliveryTypeModule {}

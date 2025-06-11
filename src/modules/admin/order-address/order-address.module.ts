import {Module} from "@nestjs/common"
import {TypeOrmModule} from "@nestjs/typeorm"
import {OrderAddressService} from "./order-address.service"
import {OrderAddressController} from "./order-address.controller"
import {OrderAddressEntity} from "./entities/order-address.entity"
import {OrderEntity} from "../order/entities/order.entity"
import {CountryEntity} from "../country/entities/country.entity"
import {CityEntity} from "../city/entities/city.entity"

@Module({
    imports: [TypeOrmModule.forFeature([OrderAddressEntity, OrderEntity, CountryEntity, CityEntity])],
    controllers: [OrderAddressController],
    providers: [OrderAddressService],
    exports: [OrderAddressService]
})
export class OrderAddressModule {}

import {Module} from "@nestjs/common"
import {TypeOrmModule} from "@nestjs/typeorm"
import {CityService} from "./city.service"
import {CityController} from "./city.controller"
import {CityEntity} from "./entities/city.entity"
import {CountryEntity} from "../country/entities/country.entity"

@Module({
    imports: [TypeOrmModule.forFeature([CityEntity, CountryEntity])],
    controllers: [CityController],
    providers: [CityService],
    exports: [CityService]
})
export class CityModule {}

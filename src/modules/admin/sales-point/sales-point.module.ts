import {Module} from "@nestjs/common"
import {TypeOrmModule} from "@nestjs/typeorm"
import {SalesPointService} from "./sales-point.service"
import {SalesPointController} from "./sales-point.controller"
import {SalesPointEntity} from "./entities/sales-point.entity"

@Module({
    imports: [TypeOrmModule.forFeature([SalesPointEntity])],
    controllers: [SalesPointController],
    providers: [SalesPointService],
    exports: [SalesPointService]
})
export class SalesPointModule {}

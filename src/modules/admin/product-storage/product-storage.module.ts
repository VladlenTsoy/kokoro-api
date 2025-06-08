import {Module} from "@nestjs/common"
import {TypeOrmModule} from "@nestjs/typeorm"
import {ProductStorageService} from "./product-storage.service"
import {ProductStorageController} from "./product-storage.controller"
import {ProductStorageEntity} from "./entities/product-storage.entity"
import {SalesPointEntity} from "../sales-point/entities/sales-point.entity"

@Module({
    imports: [TypeOrmModule.forFeature([ProductStorageEntity, SalesPointEntity])],
    controllers: [ProductStorageController],
    providers: [ProductStorageService],
    exports: [ProductStorageService]
})
export class ProductStorageModule {}

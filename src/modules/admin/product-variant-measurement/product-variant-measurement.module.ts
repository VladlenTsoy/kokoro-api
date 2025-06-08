import {Module} from "@nestjs/common"
import {TypeOrmModule} from "@nestjs/typeorm"
import {ProductVariantMeasurementService} from "./product-variant-measurement.service"
import {ProductVariantMeasurementController} from "./product-variant-measurement.controller"
import {ProductVariantMeasurementEntity} from "./entities/product-variant-measurement.entity"

@Module({
    imports: [TypeOrmModule.forFeature([ProductVariantMeasurementEntity])],
    controllers: [ProductVariantMeasurementController],
    providers: [ProductVariantMeasurementService],
    exports: [ProductVariantMeasurementService]
})
export class ProductVariantMeasurementModule {}

import {Module} from "@nestjs/common"
import {TypeOrmModule} from "@nestjs/typeorm"
import {ProductVariantEntity} from "../product-variant/entities/product-variant.entity"
import {ProductVariantSizeEntity} from "../product-variant-size/entities/product-variant-size.entity"
import {ProductBarcodeEntity} from "./entities/product-barcode.entity"
import {ProductBarcodeController} from "./product-barcode.controller"
import {ProductBarcodeService} from "./product-barcode.service"

@Module({
    imports: [TypeOrmModule.forFeature([ProductBarcodeEntity, ProductVariantEntity, ProductVariantSizeEntity])],
    controllers: [ProductBarcodeController],
    providers: [ProductBarcodeService],
    exports: [ProductBarcodeService]
})
export class ProductBarcodeModule {}

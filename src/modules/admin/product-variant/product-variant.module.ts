import {Module} from "@nestjs/common"
import {ProductVariantService} from "./product-variant.service"
import {ProductVariantController} from "./product-variant.controller"
import {TypeOrmModule} from "@nestjs/typeorm"
import {ProductVariantEntity} from "./entities/product-variant.entity"
import {ProductModule} from "../product/product.module"
import {ProductVariantSizeModule} from "../product-variant-size/product-variant-size.module"
import {ProductVariantImageModule} from "../product-variant-image/product-variant-image.module"
import {AwsModule} from "../aws/aws.module"
import {ProductTagModule} from "../product-tag/product-tag.module"
import {ProductVariantDiscountModule} from "../product-variant-discount/product-variant-discount.module"
import {ProductVariantMeasurementModule} from "../product-variant-measurement/product-variant-measurement.module"

@Module({
    imports: [
        TypeOrmModule.forFeature([ProductVariantEntity]),
        ProductModule,
        ProductVariantSizeModule,
        ProductVariantImageModule,
        AwsModule,
        ProductTagModule,
        ProductVariantDiscountModule,
        ProductVariantMeasurementModule
    ],
    controllers: [ProductVariantController],
    providers: [ProductVariantService]
})
export class ProductVariantModule {}

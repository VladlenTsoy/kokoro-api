import {Module} from "@nestjs/common"
import {TypeOrmModule} from "@nestjs/typeorm"
import {ProductVariantDiscountService} from "./product-variant-discount.service"
import {ProductVariantDiscountController} from "./product-variant-discount.controller"
import {ProductVariantDiscountEntity} from "./entities/product-variant-discount.entity"

@Module({
    imports: [TypeOrmModule.forFeature([ProductVariantDiscountEntity])],
    controllers: [ProductVariantDiscountController],
    providers: [ProductVariantDiscountService],
    exports: [ProductVariantDiscountService]
})
export class ProductVariantDiscountModule {}

import {Module} from "@nestjs/common"
import {TypeOrmModule} from "@nestjs/typeorm"
import {ProductVariantStatusEntity} from "./entities/product-variant-status.entity"
import {ProductVariantStatusService} from "./product-variant-status.service"
import {ProductVariantStatusController} from "./product-variant-status.controller"

@Module({
    imports: [TypeOrmModule.forFeature([ProductVariantStatusEntity])],
    controllers: [ProductVariantStatusController],
    providers: [ProductVariantStatusService],
    exports: [ProductVariantStatusService]
})
export class ProductVariantStatusModule {}

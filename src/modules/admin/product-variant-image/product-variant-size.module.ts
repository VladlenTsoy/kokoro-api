import {Module} from "@nestjs/common"
import {TypeOrmModule} from "@nestjs/typeorm"
import {ProductVariantImageEntity} from "./entities/product-variant-image.entity"
import {ProductVariantImageService} from "./product-variant-image.service"

@Module({
    imports: [TypeOrmModule.forFeature([ProductVariantImageEntity])],
    providers: [ProductVariantImageService],
    exports: [ProductVariantImageService]
})
export class ProductVariantSizeModule {}

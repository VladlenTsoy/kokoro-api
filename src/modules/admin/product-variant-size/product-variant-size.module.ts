import {Module} from "@nestjs/common"
import {TypeOrmModule} from "@nestjs/typeorm"
import {ProductVariantSizeEntity} from "./entities/product-variant-size.entity"
import {ProductVariantSizeService} from "./product-variant-size.service"

@Module({
    imports: [TypeOrmModule.forFeature([ProductVariantSizeEntity])],
    providers: [ProductVariantSizeService],
    exports: [ProductVariantSizeService]
})
export class ProductVariantSizeModule {}

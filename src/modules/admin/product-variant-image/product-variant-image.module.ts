import {Module} from "@nestjs/common"
import {TypeOrmModule} from "@nestjs/typeorm"
import {ProductVariantImageEntity} from "./entities/product-variant-image.entity"
import {ProductVariantImageService} from "./product-variant-image.service"
import {AwsModule} from "../aws/aws.module"

@Module({
    imports: [TypeOrmModule.forFeature([ProductVariantImageEntity]), AwsModule],
    providers: [ProductVariantImageService],
    exports: [ProductVariantImageService]
})
export class ProductVariantImageModule {}

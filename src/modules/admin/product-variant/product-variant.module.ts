import {Module} from "@nestjs/common"
import {ProductVariantService} from "./product-variant.service"
import {ProductVariantController} from "./product-variant.controller"
import {ProductService} from "../product/product.service"
import {TypeOrmModule} from "@nestjs/typeorm"
import {ProductVariantEntity} from "./entities/product-variant.entity"
import {AwsService} from "../aws/aws.service"

@Module({
    imports: [TypeOrmModule.forFeature([ProductVariantEntity])],
    controllers: [ProductVariantController],
    providers: [ProductVariantService, ProductService, AwsService]
})
export class ProductVariantModule {}

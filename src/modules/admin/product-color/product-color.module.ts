import {Module} from "@nestjs/common"
import {ProductColorService} from "./services/product-color.service"
import {ProductColorController} from "./product-color.controller"
import {ProductService} from "./services/product.service"
import {TypeOrmModule} from "@nestjs/typeorm"
import {ProductEntity} from "./entities/product.entity"
import {ProductColorEntity} from "./entities/product-color.entity"
import {ProductColorSizeEntity} from "./entities/product-color-size.entity"
import {ProductColorSizeService} from "./services/product-color-size.service"
import {ProductColorImageService} from "./services/product-color-image.service"
import {ProductColorImageEntity} from "./entities/product-color-image.entity"
import {AwsService} from "../aws/aws.service"

@Module({
    imports: [
        TypeOrmModule.forFeature([ProductEntity, ProductColorEntity, ProductColorSizeEntity, ProductColorImageEntity])
    ],
    controllers: [ProductColorController],
    providers: [ProductColorService, ProductService, ProductColorSizeService, ProductColorImageService, AwsService]
})
export class ProductColorModule {
}

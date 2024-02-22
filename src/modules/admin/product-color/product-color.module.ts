import {Module} from "@nestjs/common"
import {ProductColorService} from "./services/product-color.service"
import {ProductColorController} from "./product-color.controller"
import {ProductService} from "./services/product.service"
import {TypeOrmModule} from "@nestjs/typeorm"
import {ProductEntity} from "./entities/product.entity"
import {ProductColorEntity} from "./entities/product-color.entity"
import {ProductSizeEntity} from "./entities/product-size.entity"
import {ProductSizeService} from "./services/product-size.service"

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ProductEntity,
            ProductColorEntity,
            ProductSizeEntity
        ])
    ],
    controllers: [ProductColorController],
    providers: [ProductColorService, ProductService, ProductSizeService]
})
export class ProductColorModule {}

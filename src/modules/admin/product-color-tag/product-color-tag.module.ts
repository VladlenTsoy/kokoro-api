import {Module} from "@nestjs/common"
import {ProductColorTagService} from "./product-color-tag.service"
import {ProductColorTagController} from "./product-color-tag.controller"
import {TypeOrmModule} from "@nestjs/typeorm"
import {ProductColorTagEntity} from "./entities/product-color-tag.entity"

@Module({
    imports: [TypeOrmModule.forFeature([ProductColorTagEntity])],
    controllers: [ProductColorTagController],
    providers: [ProductColorTagService]
})
export class ProductColorTagModule {}

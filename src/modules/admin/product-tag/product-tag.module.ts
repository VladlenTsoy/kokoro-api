import {Module} from "@nestjs/common"
import {ProductTagService} from "./product-tag.service"
import {ProductTagController} from "./product-tag.controller"
import {TypeOrmModule} from "@nestjs/typeorm"
import {ProductTagEntity} from "./entities/product-tag.entity"

@Module({
    imports: [TypeOrmModule.forFeature([ProductTagEntity])],
    controllers: [ProductTagController],
    providers: [ProductTagService]
})
export class ProductTagModule {}

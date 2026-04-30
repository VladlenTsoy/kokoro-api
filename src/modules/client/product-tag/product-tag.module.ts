import {Module} from "@nestjs/common"
import {TypeOrmModule} from "@nestjs/typeorm"
import {ProductTagEntity} from "../../admin/product-tag/entities/product-tag.entity"
import {ClientProductTagController} from "./product-tag.controller"
import {ClientProductTagService} from "./product-tag.service"

@Module({
    imports: [TypeOrmModule.forFeature([ProductTagEntity])],
    controllers: [ClientProductTagController],
    providers: [ClientProductTagService]
})
export class ClientProductTagModule {}

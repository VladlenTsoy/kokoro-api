import {Module} from "@nestjs/common"
import {TypeOrmModule} from "@nestjs/typeorm"
import {CollectionEntity} from "../../admin/collection/entities/collection.entity"
import {ClientCollectionService} from "./collection.service"
import {ClientCollectionController} from "./collection.controller"
import {ProductVariantEntity} from "../../admin/product-variant/entities/product-variant.entity"

@Module({
    imports: [TypeOrmModule.forFeature([CollectionEntity, ProductVariantEntity])],
    controllers: [ClientCollectionController],
    providers: [ClientCollectionService]
})
export class ClientCollectionModule {}

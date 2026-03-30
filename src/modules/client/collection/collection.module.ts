import {Module} from "@nestjs/common"
import {TypeOrmModule} from "@nestjs/typeorm"
import {CollectionEntity} from "../../admin/collection/entities/collection.entity"
import {ClientCollectionService} from "./collection.service"
import {ClientCollectionController} from "./collection.controller"

@Module({
    imports: [TypeOrmModule.forFeature([CollectionEntity])],
    controllers: [ClientCollectionController],
    providers: [ClientCollectionService]
})
export class ClientCollectionModule {}

import {Module} from "@nestjs/common"
import {TypeOrmModule} from "@nestjs/typeorm"
import {CollectionEntity} from "./entities/collection.entity"
import {CollectionService} from "./collection.service"
import {CollectionController} from "./collection.controller"

@Module({
    imports: [TypeOrmModule.forFeature([CollectionEntity])],
    controllers: [CollectionController],
    providers: [CollectionService],
    exports: [CollectionService]
})
export class CollectionModule {}

import {Module} from "@nestjs/common"
import {TypeOrmModule} from "@nestjs/typeorm"
import {SourceService} from "./source.service"
import {SourceController} from "./source.controller"
import {SourceEntity} from "./entities/source.entity"

@Module({
    imports: [TypeOrmModule.forFeature([SourceEntity])],
    controllers: [SourceController],
    providers: [SourceService],
    exports: [SourceService]
})
export class SourceModule {}

import {Module} from "@nestjs/common"
import {TypeOrmModule} from "@nestjs/typeorm"
import {SearchZeroResultEntity} from "./entities/search-zero-result.entity"
import {SearchZeroResultController} from "./search-zero-result.controller"
import {SearchZeroResultService} from "./search-zero-result.service"

@Module({
    imports: [TypeOrmModule.forFeature([SearchZeroResultEntity])],
    controllers: [SearchZeroResultController],
    providers: [SearchZeroResultService]
})
export class SearchZeroResultModule {}

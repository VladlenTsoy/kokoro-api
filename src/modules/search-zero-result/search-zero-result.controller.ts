import {Body, Controller, Get, Post} from "@nestjs/common"
import {ApiOperation, ApiTags} from "@nestjs/swagger"
import {CreateSearchZeroResultDto} from "./dto/create-search-zero-result.dto"
import {SearchZeroResultService} from "./search-zero-result.service"

@ApiTags("Search Zero Results")
@Controller()
export class SearchZeroResultController {
    constructor(private readonly service: SearchZeroResultService) {}

    @Post("search-zero-results")
    @ApiOperation({summary: "Record a zero-result catalog search query"})
    record(@Body() dto: CreateSearchZeroResultDto) {
        return this.service.record(dto.query)
    }

    @Get("admin/search-zero-results")
    @ApiOperation({summary: "Get aggregated zero-result catalog search queries"})
    findAll() {
        return this.service.findAll()
    }
}

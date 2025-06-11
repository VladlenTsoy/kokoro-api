import {Controller, Get, Post, Body, Patch, Param, Delete} from "@nestjs/common"
import {SourceService} from "./source.service"
import {CreateSourceDto} from "./dto/create-source.dto"
import {UpdateSourceDto} from "./dto/update-source.dto"
import {ApiTags, ApiOperation, ApiParam} from "@nestjs/swagger"

@ApiTags("Sources")
@Controller("sources")
export class SourceController {
    constructor(private readonly service: SourceService) {}

    @Post()
    @ApiOperation({summary: "Создать источник заказа"})
    create(@Body() dto: CreateSourceDto) {
        return this.service.create(dto)
    }

    @Get()
    @ApiOperation({summary: "Получить все источники"})
    findAll() {
        return this.service.findAll()
    }

    @Get(":id")
    @ApiOperation({summary: "Получить источник по ID"})
    @ApiParam({name: "id", type: Number})
    findOne(@Param("id") id: string) {
        return this.service.findOne(+id)
    }

    @Patch(":id")
    @ApiOperation({summary: "Обновить источник"})
    update(@Param("id") id: string, @Body() dto: UpdateSourceDto) {
        return this.service.update(+id, dto)
    }

    @Delete(":id")
    @ApiOperation({summary: "Удалить источник"})
    remove(@Param("id") id: string) {
        return this.service.remove(+id)
    }
}

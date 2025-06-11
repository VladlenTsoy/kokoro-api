import {Controller, Get, Post, Body, Patch, Param, Delete} from "@nestjs/common"
import {CityService} from "./city.service"
import {CreateCityDto} from "./dto/create-city.dto"
import {UpdateCityDto} from "./dto/update-city.dto"
import {ApiTags, ApiOperation, ApiParam} from "@nestjs/swagger"

@ApiTags("Cities")
@Controller("cities")
export class CityController {
    constructor(private readonly service: CityService) {}

    @Post()
    @ApiOperation({summary: "Создать город"})
    create(@Body() dto: CreateCityDto) {
        return this.service.create(dto)
    }

    @Get()
    @ApiOperation({summary: "Получить все города"})
    findAll() {
        return this.service.findAll()
    }

    @Get(":id")
    @ApiOperation({summary: "Получить город по ID"})
    @ApiParam({name: "id", type: Number})
    findOne(@Param("id") id: string) {
        return this.service.findOne(+id)
    }

    @Patch(":id")
    @ApiOperation({summary: "Обновить город"})
    update(@Param("id") id: string, @Body() dto: UpdateCityDto) {
        return this.service.update(+id, dto)
    }

    @Delete(":id")
    @ApiOperation({summary: "Удалить город"})
    remove(@Param("id") id: string) {
        return this.service.remove(+id)
    }
}

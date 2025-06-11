import {Controller, Get, Post, Body, Patch, Param, Delete} from "@nestjs/common"
import {CountryService} from "./country.service"
import {CreateCountryDto} from "./dto/create-country.dto"
import {UpdateCountryDto} from "./dto/update-country.dto"
import {ApiTags, ApiOperation, ApiParam} from "@nestjs/swagger"

@ApiTags("Countries")
@Controller("countries")
export class CountryController {
    constructor(private readonly service: CountryService) {}

    @Post()
    @ApiOperation({summary: "Создать страну"})
    create(@Body() dto: CreateCountryDto) {
        return this.service.create(dto)
    }

    @Get()
    @ApiOperation({summary: "Получить все страны"})
    findAll() {
        return this.service.findAll()
    }

    @Get(":id")
    @ApiOperation({summary: "Получить страну по ID"})
    @ApiParam({name: "id", type: Number})
    findOne(@Param("id") id: string) {
        return this.service.findOne(+id)
    }

    @Patch(":id")
    @ApiOperation({summary: "Обновить страну"})
    update(@Param("id") id: string, @Body() dto: UpdateCountryDto) {
        return this.service.update(+id, dto)
    }

    @Delete(":id")
    @ApiOperation({summary: "Удалить страну"})
    remove(@Param("id") id: string) {
        return this.service.remove(+id)
    }
}

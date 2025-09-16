import {Body, Controller, Delete, Get, Param, Patch, Post, UsePipes, ValidationPipe} from "@nestjs/common"
import {CountryService} from "./country.service"
import {CreateCountryDto} from "./dto/create-country.dto"
import {UpdateCountryDto} from "./dto/update-country.dto"
import {ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags} from "@nestjs/swagger"
import {CountryEntity} from "./entities/country.entity"

@ApiTags("Countries")
@Controller("admin/countries")
export class CountryController {
    constructor(private readonly service: CountryService) {}

    @Post()
    @ApiOperation({summary: "Create country"})
    @ApiBody({type: CreateCountryDto})
    @UsePipes(new ValidationPipe({transform: true}))
    @ApiResponse({
        status: 200,
        description: "New country created",
        type: CountryEntity
    })
    create(@Body() dto: CreateCountryDto) {
        return this.service.create(dto)
    }

    @Get()
    @ApiOperation({summary: "Get all countries"})
    @ApiResponse({
        status: 200,
        description: "Get all countries",
        type: [CountryEntity]
    })
    findAll() {
        return this.service.findAll()
    }

    @Get(":id")
    @ApiOperation({summary: "Get country by id"})
    @ApiResponse({
        status: 200,
        description: "Get countries by id",
        type: CountryEntity
    })
    @ApiParam({name: "id", type: Number})
    findOne(@Param("id") id: string) {
        return this.service.findOne(+id)
    }

    @Patch(":id")
    @ApiOperation({summary: "Update country by id"})
    @ApiBody({type: UpdateCountryDto})
    @UsePipes(new ValidationPipe({transform: true}))
    @ApiResponse({
        status: 200,
        description: "Update country by id",
        type: CountryEntity
    })
    update(@Param("id") id: string, @Body() dto: UpdateCountryDto) {
        return this.service.update(+id, dto)
    }

    @Delete(":id")
    @ApiOperation({summary: "Delete country by id"})
    remove(@Param("id") id: string) {
        return this.service.remove(+id)
    }
}

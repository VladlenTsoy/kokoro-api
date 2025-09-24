import {Body, Controller, Delete, Get, Param, Patch, Post, UsePipes, ValidationPipe} from "@nestjs/common"
import {CityService} from "./city.service"
import {CreateCityDto} from "./dto/create-city.dto"
import {UpdateCityDto} from "./dto/update-city.dto"
import {ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags} from "@nestjs/swagger"
import {CityEntity} from "./entities/city.entity"

@ApiTags("Cities")
@Controller("cities")
export class CityController {
    constructor(private readonly service: CityService) {}

    @Post()
    @ApiOperation({summary: "Create city"})
    @ApiBody({type: CreateCityDto})
    @UsePipes(new ValidationPipe({transform: true}))
    @ApiResponse({
        status: 200,
        description: "New city created",
        type: CityEntity
    })
    create(@Body() dto: CreateCityDto) {
        return this.service.create(dto)
    }

    @Get()
    @ApiOperation({summary: "Get all cities"})
    @ApiResponse({
        status: 200,
        description: "Get all cities",
        type: [CityEntity]
    })
    findAll() {
        return this.service.findAll()
    }

    @Get(":id")
    @ApiOperation({summary: "Get city by id"})
    @ApiParam({name: "id", type: Number})
    @ApiResponse({
        status: 200,
        description: "Get city by id",
        type: CityEntity
    })
    findOne(@Param("id") id: string) {
        return this.service.findOne(+id)
    }

    @Patch(":id")
    @ApiOperation({summary: "Update city by id"})
    @ApiBody({type: UpdateCityDto})
    @UsePipes(new ValidationPipe({transform: true}))
    @ApiResponse({
        status: 200,
        description: "Update city by id",
        type: CityEntity
    })
    update(@Param("id") id: string, @Body() dto: UpdateCityDto) {
        return this.service.update(+id, dto)
    }

    @Delete(":id")
    @ApiOperation({summary: "Delete city by id"})
    remove(@Param("id") id: string) {
        return this.service.remove(+id)
    }
}

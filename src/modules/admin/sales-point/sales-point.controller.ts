import {Controller, Get, Post, Body, Patch, Param, Delete} from "@nestjs/common"
import {SalesPointService} from "./sales-point.service"
import {CreateSalesPointDto} from "./dto/create-sales-point.dto"
import {UpdateSalesPointDto} from "./dto/update-sales-point.dto"
import {ApiTags, ApiOperation, ApiParam} from "@nestjs/swagger"

@ApiTags("Sales Points")
@Controller("admin/sales-points")
export class SalesPointController {
    constructor(private readonly service: SalesPointService) {}

    @Post()
    @ApiOperation({summary: "Создать точку продаж"})
    create(@Body() dto: CreateSalesPointDto) {
        return this.service.create(dto)
    }

    @Get()
    @ApiOperation({summary: "Получить все точки продаж"})
    findAll() {
        return this.service.findAll()
    }

    @Get(":id")
    @ApiOperation({summary: "Получить точку продаж по ID"})
    @ApiParam({name: "id", type: Number})
    findOne(@Param("id") id: string) {
        return this.service.findOne(+id)
    }

    @Patch(":id")
    @ApiOperation({summary: "Обновить точку продаж"})
    update(@Param("id") id: string, @Body() dto: UpdateSalesPointDto) {
        return this.service.update(+id, dto)
    }

    @Delete(":id")
    @ApiOperation({summary: "Удалить точку продаж"})
    remove(@Param("id") id: string) {
        return this.service.remove(+id)
    }
}

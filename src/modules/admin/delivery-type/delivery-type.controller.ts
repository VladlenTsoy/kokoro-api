import {Controller, Get, Post, Body, Patch, Param, Delete} from "@nestjs/common"
import {DeliveryTypeService} from "./delivery-type.service"
import {CreateDeliveryTypeDto} from "./dto/create-delivery-type.dto"
import {UpdateDeliveryTypeDto} from "./dto/update-delivery-type.dto"
import {ApiTags, ApiOperation, ApiParam} from "@nestjs/swagger"

@ApiTags("Delivery Types")
@Controller("delivery-types")
export class DeliveryTypeController {
    constructor(private readonly service: DeliveryTypeService) {}

    @Post()
    @ApiOperation({summary: "Создать тип доставки"})
    create(@Body() dto: CreateDeliveryTypeDto) {
        return this.service.create(dto)
    }

    @Get()
    @ApiOperation({summary: "Получить все типы доставок"})
    findAll() {
        return this.service.findAll()
    }

    @Get(":id")
    @ApiOperation({summary: "Получить тип доставки по ID"})
    @ApiParam({name: "id", type: Number})
    findOne(@Param("id") id: string) {
        return this.service.findOne(+id)
    }

    @Patch(":id")
    @ApiOperation({summary: "Обновить тип доставки"})
    update(@Param("id") id: string, @Body() dto: UpdateDeliveryTypeDto) {
        return this.service.update(+id, dto)
    }

    @Delete(":id")
    @ApiOperation({summary: "Удалить тип доставки"})
    remove(@Param("id") id: string) {
        return this.service.remove(+id)
    }
}

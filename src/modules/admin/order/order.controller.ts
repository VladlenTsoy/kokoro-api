import {Controller, Get, Post, Body, Patch, Param, Delete} from "@nestjs/common"
import {OrderService} from "./order.service"
import {CreateOrderDto} from "./dto/create-order.dto"
import {UpdateOrderDto} from "./dto/update-order.dto"
import {ApiTags, ApiOperation, ApiParam} from "@nestjs/swagger"

@ApiTags("Orders")
@Controller("orders")
export class OrderController {
    constructor(private readonly service: OrderService) {}

    @Post()
    @ApiOperation({summary: "Создать заказ"})
    create(@Body() dto: CreateOrderDto) {
        return this.service.create(dto)
    }

    @Get()
    @ApiOperation({summary: "Получить все заказы"})
    findAll() {
        return this.service.findAll()
    }

    @Get(":id")
    @ApiOperation({summary: "Получить заказ по ID"})
    @ApiParam({name: "id", type: Number})
    findOne(@Param("id") id: string) {
        return this.service.findOne(+id)
    }

    @Patch(":id")
    @ApiOperation({summary: "Обновить заказ"})
    update(@Param("id") id: string, @Body() dto: UpdateOrderDto) {
        return this.service.update(+id, dto)
    }

    @Delete(":id")
    @ApiOperation({summary: "Удалить заказ"})
    remove(@Param("id") id: string) {
        return this.service.remove(+id)
    }
}

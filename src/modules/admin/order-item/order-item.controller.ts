import {Controller, Get, Post, Body, Patch, Param, Delete} from "@nestjs/common"
import {OrderItemService} from "./order-item.service"
import {CreateOrderItemDto} from "./dto/create-order-item.dto"
import {UpdateOrderItemDto} from "./dto/update-order-item.dto"
import {ApiTags, ApiOperation, ApiParam} from "@nestjs/swagger"

@ApiTags("Order Items")
@Controller("order-items")
export class OrderItemController {
    constructor(private readonly service: OrderItemService) {}

    @Post()
    @ApiOperation({summary: "Создать позицию заказа"})
    create(@Body() dto: CreateOrderItemDto) {
        return this.service.create(dto)
    }

    @Get()
    @ApiOperation({summary: "Получить все позиции заказов"})
    findAll() {
        return this.service.findAll()
    }

    @Get(":id")
    @ApiOperation({summary: "Получить позицию по ID"})
    @ApiParam({name: "id", type: Number})
    findOne(@Param("id") id: string) {
        return this.service.findOne(+id)
    }

    @Patch(":id")
    @ApiOperation({summary: "Обновить позицию заказа"})
    update(@Param("id") id: string, @Body() dto: UpdateOrderItemDto) {
        return this.service.update(+id, dto)
    }

    @Delete(":id")
    @ApiOperation({summary: "Удалить позицию заказа"})
    remove(@Param("id") id: string) {
        return this.service.remove(+id)
    }
}

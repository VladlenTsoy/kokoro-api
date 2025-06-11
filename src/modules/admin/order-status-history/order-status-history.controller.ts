import {Controller, Get, Post, Body, Patch, Param, Delete} from "@nestjs/common"
import {OrderStatusHistoryService} from "./order-status-history.service"
import {CreateOrderStatusHistoryDto} from "./dto/create-order-status-history.dto"
import {UpdateOrderStatusHistoryDto} from "./dto/update-order-status-history.dto"
import {ApiTags, ApiOperation, ApiParam} from "@nestjs/swagger"

@ApiTags("Order Status History")
@Controller("order-status-history")
export class OrderStatusHistoryController {
    constructor(private readonly service: OrderStatusHistoryService) {}

    @Post()
    @ApiOperation({summary: "Создать запись перехода статуса заказа"})
    create(@Body() dto: CreateOrderStatusHistoryDto) {
        return this.service.create(dto)
    }

    @Get()
    @ApiOperation({summary: "Получить все записи истории статусов"})
    findAll() {
        return this.service.findAll()
    }

    @Get(":id")
    @ApiOperation({summary: "Получить запись по ID"})
    @ApiParam({name: "id", type: Number})
    findOne(@Param("id") id: string) {
        return this.service.findOne(+id)
    }

    @Patch(":id")
    @ApiOperation({summary: "Обновить запись истории статуса"})
    update(@Param("id") id: string, @Body() dto: UpdateOrderStatusHistoryDto) {
        return this.service.update(+id, dto)
    }

    @Delete(":id")
    @ApiOperation({summary: "Удалить запись истории статуса"})
    remove(@Param("id") id: string) {
        return this.service.remove(+id)
    }
}

import {Controller, Get, Post, Body, Patch, Param, Delete} from "@nestjs/common"
import {OrderStatusService} from "./order-status.service"
import {CreateOrderStatusDto} from "./dto/create-order-status.dto"
import {UpdateOrderStatusDto} from "./dto/update-order-status.dto"
import {ApiTags, ApiOperation, ApiParam} from "@nestjs/swagger"

@ApiTags("Order Statuses")
@Controller("order-statuses")
export class OrderStatusController {
    constructor(private readonly service: OrderStatusService) {}

    @Post()
    @ApiOperation({summary: "Создать статус заказа"})
    create(@Body() dto: CreateOrderStatusDto) {
        return this.service.create(dto)
    }

    @Get()
    @ApiOperation({summary: "Получить все статусы заказа"})
    findAll() {
        return this.service.findAll()
    }

    @Get(":id")
    @ApiOperation({summary: "Получить статус заказа по ID"})
    @ApiParam({name: "id", type: Number})
    findOne(@Param("id") id: string) {
        return this.service.findOne(+id)
    }

    @Patch(":id")
    @ApiOperation({summary: "Обновить статус заказа"})
    update(@Param("id") id: string, @Body() dto: UpdateOrderStatusDto) {
        return this.service.update(+id, dto)
    }

    @Delete(":id")
    @ApiOperation({summary: "Удалить статус заказа"})
    remove(@Param("id") id: string) {
        return this.service.remove(+id)
    }
}

import {Controller, Get, Post, Body, Patch, Param, Delete} from "@nestjs/common"
import {OrderStatusNotificationService} from "./order-status-notification.service"
import {CreateOrderStatusNotificationDto} from "./dto/create-order-status-notification.dto"
import {UpdateOrderStatusNotificationDto} from "./dto/update-order-status-notification.dto"
import {ApiTags, ApiOperation, ApiParam} from "@nestjs/swagger"

@ApiTags("Order Status Notifications")
@Controller("order-status-notifications")
export class OrderStatusNotificationController {
    constructor(private readonly service: OrderStatusNotificationService) {}

    @Post()
    @ApiOperation({summary: "Создать уведомление по статусу заказа"})
    create(@Body() dto: CreateOrderStatusNotificationDto) {
        return this.service.create(dto)
    }

    @Get()
    @ApiOperation({summary: "Получить все уведомления по статусам"})
    findAll() {
        return this.service.findAll()
    }

    @Get(":id")
    @ApiOperation({summary: "Получить уведомление по ID"})
    @ApiParam({name: "id", type: Number})
    findOne(@Param("id") id: string) {
        return this.service.findOne(+id)
    }

    @Patch(":id")
    @ApiOperation({summary: "Обновить уведомление по статусу"})
    update(@Param("id") id: string, @Body() dto: UpdateOrderStatusNotificationDto) {
        return this.service.update(+id, dto)
    }

    @Delete(":id")
    @ApiOperation({summary: "Удалить уведомление по статусу"})
    remove(@Param("id") id: string) {
        return this.service.remove(+id)
    }
}

import {Controller, Get, Post, Body, Patch, Param, Delete} from "@nestjs/common"
import {OrderAddressService} from "./order-address.service"
import {CreateOrderAddressDto} from "./dto/create-order-address.dto"
import {UpdateOrderAddressDto} from "./dto/update-order-address.dto"
import {ApiTags, ApiOperation, ApiParam} from "@nestjs/swagger"

@ApiTags("Order Addresses")
@Controller("order-addresses")
export class OrderAddressController {
    constructor(private readonly service: OrderAddressService) {}

    @Post()
    @ApiOperation({summary: "Создать адрес заказа"})
    create(@Body() dto: CreateOrderAddressDto) {
        return this.service.create(dto)
    }

    @Get()
    @ApiOperation({summary: "Получить все адреса заказов"})
    findAll() {
        return this.service.findAll()
    }

    @Get(":id")
    @ApiOperation({summary: "Получить адрес заказа по ID"})
    @ApiParam({name: "id", type: Number})
    findOne(@Param("id") id: string) {
        return this.service.findOne(+id)
    }

    @Patch(":id")
    @ApiOperation({summary: "Обновить адрес заказа"})
    update(@Param("id") id: string, @Body() dto: UpdateOrderAddressDto) {
        return this.service.update(+id, dto)
    }

    @Delete(":id")
    @ApiOperation({summary: "Удалить адрес заказа"})
    remove(@Param("id") id: string) {
        return this.service.remove(+id)
    }
}

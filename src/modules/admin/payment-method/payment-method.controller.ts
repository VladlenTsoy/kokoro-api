import {Controller, Get, Post, Body, Patch, Param, Delete} from "@nestjs/common"
import {PaymentMethodService} from "./payment-method.service"
import {CreatePaymentMethodDto} from "./dto/create-payment-method.dto"
import {UpdatePaymentMethodDto} from "./dto/update-payment-method.dto"
import {ApiTags, ApiOperation, ApiParam} from "@nestjs/swagger"

@ApiTags("Payment Methods")
@Controller("payment-method")
export class PaymentMethodController {
    constructor(private readonly service: PaymentMethodService) {}

    @Post()
    @ApiOperation({summary: "Создать метод оплаты"})
    create(@Body() dto: CreatePaymentMethodDto) {
        return this.service.create(dto)
    }

    @Get()
    @ApiOperation({summary: "Получить все методы оплаты"})
    findAll() {
        return this.service.findAll()
    }

    @Get(":id")
    @ApiOperation({summary: "Получить метод оплаты по ID"})
    @ApiParam({name: "id", type: Number})
    findOne(@Param("id") id: string) {
        return this.service.findOne(+id)
    }

    @Patch(":id")
    @ApiOperation({summary: "Обновить метод оплаты"})
    update(@Param("id") id: string, @Body() dto: UpdatePaymentMethodDto) {
        return this.service.update(+id, dto)
    }

    @Delete(":id")
    @ApiOperation({summary: "Удалить метод оплаты"})
    remove(@Param("id") id: string) {
        return this.service.remove(+id)
    }
}

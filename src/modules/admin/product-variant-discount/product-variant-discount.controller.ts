import {Controller, Get, Post, Body, Patch, Param, Delete} from "@nestjs/common"
import {ProductVariantDiscountService} from "./product-variant-discount.service"
import {CreateProductVariantDiscountDto} from "./dto/create-product-variant-discount.dto"
import {UpdateProductVariantDiscountDto} from "./dto/update-product-variant-discount.dto"
import {ApiTags, ApiOperation, ApiParam} from "@nestjs/swagger"

@ApiTags("Product Variant Discounts")
@Controller("product-variant-discounts")
export class ProductVariantDiscountController {
    constructor(private readonly service: ProductVariantDiscountService) {}

    @Post()
    @ApiOperation({summary: "Создать скидку для варианта"})
    create(@Body() dto: CreateProductVariantDiscountDto) {
        return this.service.create(dto)
    }

    @Get()
    @ApiOperation({summary: "Получить все скидки"})
    findAll() {
        return this.service.findAll()
    }

    @Get(":id")
    @ApiOperation({summary: "Получить скидку по ID"})
    @ApiParam({name: "id", type: Number})
    findOne(@Param("id") id: string) {
        return this.service.findOne(+id)
    }

    @Patch(":id")
    @ApiOperation({summary: "Обновить скидку"})
    update(@Param("id") id: string, @Body() dto: UpdateProductVariantDiscountDto) {
        return this.service.update(+id, dto)
    }

    @Delete(":id")
    @ApiOperation({summary: "Удалить скидку"})
    remove(@Param("id") id: string) {
        return this.service.remove(+id)
    }
}

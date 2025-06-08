import {Controller, Get, Post, Body, Patch, Param, Delete} from "@nestjs/common"
import {ProductVariantMeasurementService} from "./product-variant-measurement.service"
import {CreateProductVariantMeasurementDto} from "./dto/create-product-variant-measurement.dto"
import {UpdateProductVariantMeasurementDto} from "./dto/update-product-variant-measurement.dto"
import {ApiTags, ApiOperation, ApiParam} from "@nestjs/swagger"

@ApiTags("Product Variant Measurements")
@Controller("product-variant-measurements")
export class ProductVariantMeasurementController {
    constructor(private readonly service: ProductVariantMeasurementService) {}

    @Post()
    @ApiOperation({summary: "Создать габариты варианта"})
    create(@Body() dto: CreateProductVariantMeasurementDto) {
        return this.service.create(dto)
    }

    @Get()
    @ApiOperation({summary: "Получить все габариты"})
    findAll() {
        return this.service.findAll()
    }

    @Get(":id")
    @ApiOperation({summary: "Получить габариты по ID"})
    @ApiParam({name: "id", type: Number})
    findOne(@Param("id") id: string) {
        return this.service.findOne(+id)
    }

    @Patch(":id")
    @ApiOperation({summary: "Обновить габариты"})
    update(@Param("id") id: string, @Body() dto: UpdateProductVariantMeasurementDto) {
        return this.service.update(+id, dto)
    }

    @Delete(":id")
    @ApiOperation({summary: "Удалить габариты"})
    remove(@Param("id") id: string) {
        return this.service.remove(+id)
    }
}

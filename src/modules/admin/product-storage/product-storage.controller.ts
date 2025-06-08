import {Controller, Get, Post, Body, Patch, Param, Delete} from "@nestjs/common"
import {ProductStorageService} from "./product-storage.service"
import {CreateProductStorageDto} from "./dto/create-product-storage.dto"
import {UpdateProductStorageDto} from "./dto/update-product-storage.dto"
import {ApiTags, ApiOperation, ApiParam} from "@nestjs/swagger"

@ApiTags("Product Storages")
@Controller("product-storages")
export class ProductStorageController {
    constructor(private readonly service: ProductStorageService) {}

    @Post()
    @ApiOperation({summary: "Создать склад"})
    create(@Body() dto: CreateProductStorageDto) {
        return this.service.create(dto)
    }

    @Get()
    @ApiOperation({summary: "Получить все склады"})
    findAll() {
        return this.service.findAll()
    }

    @Get(":id")
    @ApiOperation({summary: "Получить склад по ID"})
    @ApiParam({name: "id", type: Number})
    findOne(@Param("id") id: string) {
        return this.service.findOne(+id)
    }

    @Patch(":id")
    @ApiOperation({summary: "Обновить склад"})
    update(@Param("id") id: string, @Body() dto: UpdateProductStorageDto) {
        return this.service.update(+id, dto)
    }

    @Delete(":id")
    @ApiOperation({summary: "Удалить склад"})
    remove(@Param("id") id: string) {
        return this.service.remove(+id)
    }
}

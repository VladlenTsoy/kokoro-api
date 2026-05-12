import {Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post} from "@nestjs/common"
import {ApiTags} from "@nestjs/swagger"
import {CreateProductBarcodeDto} from "./dto/create-product-barcode.dto"
import {UpdateProductBarcodeDto} from "./dto/update-product-barcode.dto"
import {ProductBarcodeService} from "./product-barcode.service"

@ApiTags("Admin Product Barcodes")
@Controller("admin/product-barcodes")
export class ProductBarcodeController {
    constructor(private readonly service: ProductBarcodeService) {}

    @Get()
    findAll() {
        return this.service.findAll()
    }

    @Get("by-code/:code")
    findByCode(@Param("code") code: string) {
        return this.service.findByCode(code)
    }

    @Post()
    create(@Body() dto: CreateProductBarcodeDto) {
        return this.service.create(dto)
    }

    @Patch(":id")
    update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateProductBarcodeDto) {
        return this.service.update(id, dto)
    }

    @Delete(":id")
    remove(@Param("id", ParseIntPipe) id: number) {
        return this.service.remove(id)
    }
}

import {Body, Controller, Post} from "@nestjs/common"
import {ProductService} from "./product.service"
import {CreateProductDto} from "./dto/create-product.dto"
import {ApiOperation, ApiTags} from "@nestjs/swagger"

@ApiTags("Products")
@Controller("products")
export class ProductController {
    constructor(private readonly service: ProductService) {}

    @Post()
    @ApiOperation({summary: "Создать продукт"})
    create(@Body() dto: CreateProductDto) {
        return this.service.create(dto)
    }
}

import {Body, Controller, Delete, Get, Param, Patch, Post, UsePipes, ValidationPipe} from "@nestjs/common"
import {ApiBody, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger"
import {ProductVariantStatusService} from "./product-variant-status.service"
import {CreateProductVariantStatusDto} from "./dto/create-product-variant-status.dto"
import {UpdateProductVariantStatusDto} from "./dto/update-product-variant-status.dto"
import {ProductVariantStatusEntity} from "./entities/product-variant-status.entity"

@ApiTags("Product Variant Status")
@Controller("admin/product-variant-status")
export class ProductVariantStatusController {
    constructor(private readonly service: ProductVariantStatusService) {}

    @Post()
    @ApiOperation({summary: "Create product variant status"})
    @ApiBody({type: CreateProductVariantStatusDto})
    @UsePipes(new ValidationPipe({transform: true}))
    @ApiResponse({
        status: 200,
        description: "New product variant status created",
        type: ProductVariantStatusEntity
    })
    create(@Body() dto: CreateProductVariantStatusDto) {
        return this.service.create(dto)
    }

    @Get()
    @ApiOperation({summary: "Get all product variant statuses"})
    @ApiResponse({
        status: 200,
        description: "List of all product variant statuses",
        type: ProductVariantStatusEntity,
        isArray: true
    })
    findAll() {
        return this.service.findAll()
    }

    @Get(":id")
    @ApiOperation({summary: "Get product variant status by id"})
    @ApiResponse({
        status: 200,
        description: "Find product variant status by id",
        type: ProductVariantStatusEntity,
        isArray: true
    })
    findOne(@Param("id") id: string) {
        return this.service.findOne(+id)
    }

    @Patch(":id")
    @ApiOperation({summary: "Update product variant by id"})
    @ApiBody({type: UpdateProductVariantStatusDto})
    @UsePipes(new ValidationPipe({transform: true}))
    @ApiResponse({
        status: 200,
        description: "Updated product variant by id",
        type: ProductVariantStatusEntity
    })
    update(@Param("id") id: string, @Body() dto: UpdateProductVariantStatusDto) {
        return this.service.update(+id, dto)
    }

    @Delete(":id")
    @ApiOperation({summary: "Delete product variant status by id"})
    @ApiResponse({
        status: 200,
        description: "Delete product variant status by id",
        type: ProductVariantStatusEntity,
        isArray: true
    })
    remove(@Param("id") id: string) {
        return this.service.remove(+id)
    }
}

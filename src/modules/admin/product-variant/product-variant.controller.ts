import {Body, Controller, Delete, Get, Param, Patch, Post, UsePipes, ValidationPipe, Req} from "@nestjs/common"
import {ProductVariantService} from "./product-variant.service"
import {CreateProductVariantDto} from "./dto/create-product-variant.dto"
import {UpdateProductVariantDto} from "./dto/update-product-variant.dto"
import {ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger"
import {ProductVariantEntity} from "./entities/product-variant.entity"
import {Request} from "express"

@ApiBearerAuth()
@ApiTags("Product Variants")
@Controller("admin/product-variant")
export class ProductVariantController {
    constructor(private readonly productVariantService: ProductVariantService) {}

    @Post()
    @ApiOperation({summary: "Create product variant"})
    @ApiBody({type: CreateProductVariantDto})
    @UsePipes(new ValidationPipe({transform: true}))
    @ApiResponse({
        status: 200,
        description: "New product variant created",
        type: ProductVariantEntity
    })
    create(@Body() createProductVariantDto: CreateProductVariantDto) {
        return this.productVariantService.create(createProductVariantDto)
    }

    @Get()
    @ApiOperation({summary: "Get all product variants"})
    @ApiResponse({
        status: 200,
        description: "List of all product variants",
        type: ProductVariantEntity,
        isArray: true
    })
    findAll(@Req() req: Request) {
        return this.productVariantService.findAll(req.query as unknown as {page: number; pageSize: number})
    }

    @Get(":id")
    findOne(@Param("id") id: string) {
        return this.productVariantService.findOne(+id)
    }

    @Patch(":id")
    update(@Param("id") id: string, @Body() updateProductVariantDto: UpdateProductVariantDto) {
        return this.productVariantService.update(+id, updateProductVariantDto)
    }

    @Delete(":id")
    remove(@Param("id") id: string) {
        return this.productVariantService.remove(+id)
    }
}

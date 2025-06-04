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
    constructor(private readonly productColorService: ProductVariantService) {}

    @Post()
    @ApiOperation({summary: "Create product color"})
    @ApiBody({type: CreateProductVariantDto})
    @UsePipes(new ValidationPipe({transform: true}))
    @ApiResponse({
        status: 200,
        description: "New product color created",
        type: ProductVariantEntity
    })
    create(@Body() createProductColorDto: CreateProductVariantDto) {
        return this.productColorService.create(createProductColorDto)
    }

    @Get()
    @ApiOperation({summary: "Get all product colors"})
    @ApiResponse({
        status: 200,
        description: "List of all product colors",
        type: ProductVariantEntity,
        isArray: true
    })
    findAll(@Req() req: Request) {
        console.log(req.query)
        return this.productColorService.findAll(req.query as unknown as {page: number; pageSize: number})
    }

    @Get(":id")
    findOne(@Param("id") id: string) {
        return this.productColorService.findOne(+id)
    }

    @Patch(":id")
    update(@Param("id") id: string, @Body() updateProductColorDto: UpdateProductVariantDto) {
        return this.productColorService.update(+id, updateProductColorDto)
    }

    @Delete(":id")
    remove(@Param("id") id: string) {
        return this.productColorService.remove(+id)
    }
}

import {Body, Controller, Delete, Get, Param, Post, UsePipes, ValidationPipe} from "@nestjs/common"
import {ProductVariantService} from "./product-variant.service"
import {CreateProductVariantDto} from "./dto/create-product-variant.dto"
import {UpdateProductVariantDto} from "./dto/update-product-variant.dto"
import {ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger"
import {ProductVariantEntity} from "./entities/product-variant.entity"
import {FilterProductVariantDto} from "./dto/filter-product-variant.dto"

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

    @Post("all")
    @ApiOperation({summary: "Get all product variants"})
    @ApiBody({type: FilterProductVariantDto})
    @UsePipes(new ValidationPipe({transform: true}))
    @ApiResponse({
        status: 200,
        description: "List of all product variants",
        type: ProductVariantEntity,
        isArray: true
    })
    findAll(@Body() filterProductVariantDto: FilterProductVariantDto) {
        return this.productVariantService.findAll(filterProductVariantDto)
    }

    @Get(":id/variants")
    @ApiOperation({summary: "Get other product variants by product_variant_id"})
    @ApiResponse({
        status: 200,
        description: "List of other product variants",
        type: ProductVariantEntity,
        isArray: true
    })
    findOtherVariants(@Param("id") id: string) {
        return this.productVariantService.findProductVariantsByProductVariantId(+id)
    }

    @Get(":id")
    findOne(@Param("id") id: string) {
        return this.productVariantService.findOne(+id)
    }

    @Post(":id")
    @ApiOperation({summary: "Update product variant"})
    @ApiBody({type: UpdateProductVariantDto})
    @UsePipes(new ValidationPipe({transform: true}))
    @ApiResponse({
        status: 200,
        description: "Updated product variant",
        type: ProductVariantEntity
    })
    update(@Param("id") id: string, @Body() updateProductVariantDto: UpdateProductVariantDto) {
        return this.productVariantService.update(+id, updateProductVariantDto)
    }

    @Delete(":id")
    remove(@Param("id") id: string) {
        return this.productVariantService.remove(+id)
    }
}

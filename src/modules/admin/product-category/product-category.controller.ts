import {Body, Controller, Delete, Get, Param, Patch, Post, UsePipes, ValidationPipe} from "@nestjs/common"
import {ProductCategoryService} from "./product-category.service"
import {CreateProductCategoryDto} from "./dto/create-product-category.dto"
import {UpdateProductCategoryDto} from "./dto/update-product-category.dto"
import {ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger"
import {ProductCategoryEntity} from "./entities/product-category.entity"

@ApiBearerAuth()
@ApiTags("ProductCategory")
@Controller("admin/product-category")
export class ProductCategoryController {
    constructor(private readonly productCategoryService: ProductCategoryService) {}

    @Post()
    @ApiOperation({summary: "Create product category"})
    @ApiBody({type: CreateProductCategoryDto})
    @ApiResponse({
        status: 200,
        description: "New product category created",
        type: ProductCategoryEntity
    })
    @UsePipes(new ValidationPipe({transform: true}))
    create(@Body() createColorDto: CreateProductCategoryDto) {
        return this.productCategoryService.create(createColorDto)
    }

    @Get()
    @ApiOperation({summary: "Get all product categories"})
    @ApiResponse({
        status: 200,
        description: "List of all product categories",
        type: ProductCategoryEntity,
        isArray: true
    })
    findAll() {
        return this.productCategoryService.findAll()
    }

    @Get(":id")
    @ApiOperation({summary: "Get product category by id"})
    @ApiResponse({
        status: 200,
        description: "Product category by id",
        type: ProductCategoryEntity
    })
    findOne(@Param("id") id: string) {
        return this.productCategoryService.findOne(+id)
    }

    @Patch(":id")
    @ApiOperation({summary: "Update product category by id"})
    @ApiBody({type: UpdateProductCategoryDto})
    @ApiResponse({
        status: 200,
        description: "Updated product category by id",
        type: ProductCategoryEntity
    })
    @UsePipes(new ValidationPipe({transform: true}))
    update(@Param("id") id: string, @Body() updateColorDto: UpdateProductCategoryDto) {
        return this.productCategoryService.update(+id, updateColorDto)
    }

    @Delete(":id")
    @ApiOperation({summary: "Delete product category by id"})
    @ApiResponse({
        status: 200,
        description: "Deleted product category by id"
    })
    remove(@Param("id") id: string) {
        return this.productCategoryService.remove(+id)
    }
}

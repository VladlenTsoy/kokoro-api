import {Body, Controller, Delete, Get, Param, Patch, Post, UsePipes, ValidationPipe} from "@nestjs/common"
import {ProductPropertyService} from "./product-property.service"
import {CreateProductPropertyDto} from "./dto/create-product-property.dto"
import {UpdateProductPropertyDto} from "./dto/update-product-property.dto"
import {ApiBody, ApiOperation, ApiResponse} from "@nestjs/swagger"
import {ProductPropertyEntity} from "./entities/product-property.entity"

@Controller("admin/product-property")
export class ProductPropertyController {
    constructor(private readonly productPropertyService: ProductPropertyService) {}

    @Post()
    @ApiOperation({summary: "Create product property"})
    @ApiBody({type: CreateProductPropertyDto})
    @ApiResponse({
        status: 200,
        description: "New color created",
        type: ProductPropertyEntity
    })
    @UsePipes(new ValidationPipe({transform: true}))
    create(@Body() createProductPropertyDto: CreateProductPropertyDto) {
        return this.productPropertyService.create(createProductPropertyDto)
    }

    @Get()
    @ApiOperation({summary: "Get all product properties"})
    @ApiResponse({
        status: 200,
        description: "List of all product properties",
        type: ProductPropertyEntity,
        isArray: true
    })
    findAll() {
        return this.productPropertyService.findAll()
    }

    @Get(":id")
    @ApiOperation({summary: "Get product property by id"})
    @ApiResponse({
        status: 200,
        description: "Product property by id",
        type: ProductPropertyEntity
    })
    findOne(@Param("id") id: string) {
        return this.productPropertyService.findOne(+id)
    }

    @Patch(":id")
    @ApiOperation({summary: "Update product property by id"})
    @ApiBody({type: UpdateProductPropertyDto})
    @ApiResponse({
        status: 200,
        description: "Updated product property by id",
        type: ProductPropertyEntity
    })
    @UsePipes(new ValidationPipe({transform: true}))
    update(@Param("id") id: string, @Body() updateProductPropertyDto: UpdateProductPropertyDto) {
        return this.productPropertyService.update(+id, updateProductPropertyDto)
    }

    @Delete(":id")
    @ApiOperation({summary: "Delete product property by id"})
    @ApiResponse({
        status: 200,
        description: "Deleted product property by id"
    })
    remove(@Param("id") id: string) {
        return this.productPropertyService.remove(+id)
    }
}

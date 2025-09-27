import {Body, Controller, Delete, Get, Param, Patch, Post, UsePipes, ValidationPipe} from "@nestjs/common"
import {ProductTagService} from "./product-tag.service"
import {CreateProductTagDto} from "./dto/create-product-tag.dto"
import {UpdateProductTagDto} from "./dto/update-product-tag.dto"
import {ApiBody, ApiOperation, ApiResponse} from "@nestjs/swagger"
import {ProductTagEntity} from "./entities/product-tag.entity"

@Controller("admin/product-variant-tag")
export class ProductTagController {
    constructor(private readonly productTagService: ProductTagService) {}

    @Post()
    @ApiOperation({summary: "Create product tag"})
    @ApiBody({type: CreateProductTagDto})
    @ApiResponse({
        status: 200,
        description: "New product tag created",
        type: ProductTagEntity
    })
    @UsePipes(new ValidationPipe({transform: true}))
    create(@Body() createProductTagDto: CreateProductTagDto) {
        return this.productTagService.create(createProductTagDto)
    }

    @Get()
    @ApiOperation({summary: "Get all product tags"})
    @ApiResponse({
        status: 200,
        description: "List of all product tags",
        type: ProductTagEntity,
        isArray: true
    })
    findAll() {
        return this.productTagService.findAll()
    }

    @Get(":id")
    @ApiOperation({summary: "Get product tag by id"})
    @ApiResponse({
        status: 200,
        description: "Product tag by id",
        type: ProductTagEntity
    })
    findOne(@Param("id") id: string) {
        return this.productTagService.findOne(+id)
    }

    @Patch(":id")
    @ApiOperation({summary: "Update product tag by id"})
    @ApiBody({type: UpdateProductTagDto})
    @ApiResponse({
        status: 200,
        description: "Updated product tag by id",
        type: ProductTagEntity
    })
    @UsePipes(new ValidationPipe({transform: true}))
    update(@Param("id") id: string, @Body() updateProductTagDto: UpdateProductTagDto) {
        return this.productTagService.update(+id, updateProductTagDto)
    }

    @Delete(":id")
    @ApiOperation({summary: "Delete product tag by id"})
    @ApiResponse({
        status: 200,
        description: "Deleted product tag by id"
    })
    remove(@Param("id") id: string) {
        return this.productTagService.remove(+id)
    }
}

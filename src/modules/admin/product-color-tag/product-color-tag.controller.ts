import {Body, Controller, Delete, Get, Param, Patch, Post, UsePipes, ValidationPipe} from "@nestjs/common"
import {ProductColorTagService} from "./product-color-tag.service"
import {CreateProductColorTagDto} from "./dto/create-product-color-tag.dto"
import {UpdateProductColorTagDto} from "./dto/update-product-color-tag.dto"
import {ApiBody, ApiOperation, ApiResponse} from "@nestjs/swagger"
import {ProductColorTagEntity} from "./entities/product-color-tag.entity"

@Controller("product-color-tag")
export class ProductColorTagController {
    constructor(private readonly productColorTagService: ProductColorTagService) {}

    @Post()
    @ApiOperation({summary: "Create product color tag"})
    @ApiBody({type: CreateProductColorTagDto})
    @ApiResponse({
        status: 200,
        description: "New product color tag created",
        type: ProductColorTagEntity
    })
    @UsePipes(new ValidationPipe({transform: true}))
    create(@Body() createProductColorTagDto: CreateProductColorTagDto) {
        return this.productColorTagService.create(createProductColorTagDto)
    }

    @Get()
    @ApiOperation({summary: "Get all product color tags"})
    @ApiResponse({
        status: 200,
        description: "List of all product color tags",
        type: ProductColorTagEntity,
        isArray: true
    })
    findAll() {
        return this.productColorTagService.findAll()
    }

    @Get(":id")
    @ApiOperation({summary: "Get product color tag by id"})
    @ApiResponse({
        status: 200,
        description: "Product color tag by id",
        type: ProductColorTagEntity
    })
    findOne(@Param("id") id: string) {
        return this.productColorTagService.findOne(+id)
    }

    @Patch(":id")
    @ApiOperation({summary: "Update product color tag by id"})
    @ApiBody({type: UpdateProductColorTagDto})
    @ApiResponse({
        status: 200,
        description: "Updated product color tag by id",
        type: ProductColorTagEntity
    })
    @UsePipes(new ValidationPipe({transform: true}))
    update(@Param("id") id: string, @Body() updateProductColorTagDto: UpdateProductColorTagDto) {
        return this.productColorTagService.update(+id, updateProductColorTagDto)
    }

    @Delete(":id")
    @ApiOperation({summary: "Delete product color tag by id"})
    @ApiResponse({
        status: 200,
        description: "Deleted product color tag by id"
    })
    remove(@Param("id") id: string) {
        return this.productColorTagService.remove(+id)
    }
}

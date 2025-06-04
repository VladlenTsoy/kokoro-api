import {Body, Controller, Delete, Get, Param, Patch, Post, UsePipes, ValidationPipe} from "@nestjs/common"
import {ProductTagService} from "./product-tag.service"
import {CreateProductTagDto} from "./dto/create-product-tag.dto"
import {UpdateProductTagDto} from "./dto/update-product-tag.dto"
import {ApiBody, ApiOperation, ApiResponse} from "@nestjs/swagger"
import {ProductTagEntity} from "./entities/product-tag.entity"

@Controller("product-variant-tag")
export class ProductTagController {
    constructor(private readonly productColorTagService: ProductTagService) {}

    @Post()
    @ApiOperation({summary: "Create product color tag"})
    @ApiBody({type: CreateProductTagDto})
    @ApiResponse({
        status: 200,
        description: "New product color tag created",
        type: ProductTagEntity
    })
    @UsePipes(new ValidationPipe({transform: true}))
    create(@Body() createProductColorTagDto: CreateProductTagDto) {
        return this.productColorTagService.create(createProductColorTagDto)
    }

    @Get()
    @ApiOperation({summary: "Get all product color tags"})
    @ApiResponse({
        status: 200,
        description: "List of all product color tags",
        type: ProductTagEntity,
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
        type: ProductTagEntity
    })
    findOne(@Param("id") id: string) {
        return this.productColorTagService.findOne(+id)
    }

    @Patch(":id")
    @ApiOperation({summary: "Update product color tag by id"})
    @ApiBody({type: UpdateProductTagDto})
    @ApiResponse({
        status: 200,
        description: "Updated product color tag by id",
        type: ProductTagEntity
    })
    @UsePipes(new ValidationPipe({transform: true}))
    update(@Param("id") id: string, @Body() updateProductColorTagDto: UpdateProductTagDto) {
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

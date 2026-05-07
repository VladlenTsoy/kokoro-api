import {Body, Controller, Delete, Get, Param, Patch, Post, Query, UsePipes, ValidationPipe} from "@nestjs/common"
import {ProductTagService} from "./product-tag.service"
import {CreateProductTagDto} from "./dto/create-product-tag.dto"
import {UpdateProductTagDto} from "./dto/update-product-tag.dto"
import {ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags} from "@nestjs/swagger"
import {ProductTagEntity, ProductTagType} from "./entities/product-tag.entity"
import {AdminPermissions} from "../auth/decorators/permissions.decorator"

@ApiTags("Product Tags")
@ApiBearerAuth("admin-bearer")
@Controller("admin/product-variant-tag")
export class ProductTagController {
    constructor(private readonly productTagService: ProductTagService) {}

    @Post()
    @AdminPermissions("catalog.create")
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
    @AdminPermissions("catalog.read")
    @ApiOperation({summary: "Get all product tags"})
    @ApiQuery({name: "type", enum: ProductTagType, required: false})
    @ApiQuery({name: "isActive", required: false})
    @ApiQuery({name: "search", required: false})
    @ApiResponse({
        status: 200,
        description: "List of all product tags",
        type: ProductTagEntity,
        isArray: true
    })
    findAll(
        @Query("type") type?: ProductTagType,
        @Query("isActive") isActive?: string,
        @Query("search") search?: string
    ) {
        return this.productTagService.findAll({
            type,
            isActive: isActive === undefined ? undefined : isActive === "true",
            search
        })
    }

    @Get(":id")
    @AdminPermissions("catalog.read")
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
    @AdminPermissions("catalog.update")
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
    @AdminPermissions("catalog.delete")
    @ApiOperation({summary: "Delete product tag by id"})
    @ApiResponse({
        status: 200,
        description: "Deleted product tag by id"
    })
    remove(@Param("id") id: string) {
        return this.productTagService.remove(+id)
    }
}

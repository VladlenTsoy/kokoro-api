import {Controller, Get, Param, Query} from "@nestjs/common"
import {ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger"
import {ClientProductVariantService} from "./product-variant.service"
import {ProductVariantEntity} from "../../admin/product-variant/entities/product-variant.entity"

@ApiTags("Product Variants")
@Controller("product/variants")
export class ClientProductVariantController {
    constructor(private readonly productVariantService: ClientProductVariantService) {}

    @Get()
    @ApiOperation({summary: "Get product variants for client"})
    @ApiResponse({
        status: 200,
        description: "List of product variants",
        type: ProductVariantEntity,
        isArray: true
    })
    findAll(
        @Query("page") page?: string,
        @Query("pageSize") pageSize?: string,
        @Query("sortOrder") sortOrder?: string
    ) {
        return this.productVariantService.findAll({
            page: page ? Number(page) : undefined,
            pageSize: pageSize ? Number(pageSize) : undefined,
            sortOrder
        })
    }

    @Get(":id")
    @ApiOperation({summary: "Get product variant by id for client"})
    @ApiResponse({
        status: 200,
        description: "Product variant",
        type: ProductVariantEntity
    })
    findOne(@Param("id") id: string) {
        return this.productVariantService.findOne(+id)
    }
}

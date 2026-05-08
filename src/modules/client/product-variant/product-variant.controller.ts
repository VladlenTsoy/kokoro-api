import {Controller, Get, Param, Query} from "@nestjs/common"
import {ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger"
import {ClientProductVariantService} from "./product-variant.service"
import {ProductVariantEntity} from "../../admin/product-variant/entities/product-variant.entity"

@ApiTags("Product Variants")
@Controller("product/variants")
export class ClientProductVariantController {
    constructor(private readonly productVariantService: ClientProductVariantService) {}

    private parseNumberList(value?: string | string[]): number[] | undefined {
        if (!value) return undefined
        const chunks = Array.isArray(value) ? value : [value]
        const values = chunks
            .flatMap((chunk) => String(chunk).split(","))
            .map((item) => Number(item.trim()))
            .filter((item) => Number.isFinite(item) && item > 0)
        if (values.length === 0) return undefined
        return Array.from(new Set(values))
    }

    private parseStringList(value?: string | string[]): string[] | undefined {
        if (!value) return undefined
        const chunks = Array.isArray(value) ? value : [value]
        const values = chunks
            .flatMap((chunk) => String(chunk).split(","))
            .map((item) => item.trim().toLowerCase())
            .filter(Boolean)
        if (values.length === 0) return undefined
        return Array.from(new Set(values))
    }

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
        @Query("sortOrder") sortOrder?: string,
        @Query("search") search?: string,
        @Query("categoryId") categoryId?: string,
        @Query("colorIds") colorIds?: string | string[],
        @Query("sizeIds") sizeIds?: string | string[],
        @Query("tagIds") tagIds?: string | string[],
        @Query("tagSlugs") tagSlugs?: string | string[]
    ) {
        return this.productVariantService.findAll({
            page: page ? Number(page) : undefined,
            pageSize: pageSize ? Number(pageSize) : undefined,
            sortOrder,
            search,
            categoryId: categoryId ? Number(categoryId) : undefined,
            colorIds: this.parseNumberList(colorIds),
            sizeIds: this.parseNumberList(sizeIds),
            tagIds: this.parseNumberList(tagIds),
            tagSlugs: this.parseStringList(tagSlugs)
        })
    }

    @Get("filters/colors")
    @ApiOperation({summary: "Get available colors for active product variants"})
    @ApiResponse({
        status: 200,
        description: "List of available colors"
    })
    findAvailableColors(@Query("categoryId") categoryId?: string) {
        return this.productVariantService.findAvailableColors(categoryId ? Number(categoryId) : undefined)
    }

    @Get("filters/sizes")
    @ApiOperation({summary: "Get available sizes for active product variants"})
    @ApiResponse({
        status: 200,
        description: "List of available sizes"
    })
    findAvailableSizes(@Query("categoryId") categoryId?: string) {
        return this.productVariantService.findAvailableSizes(categoryId ? Number(categoryId) : undefined)
    }

    @Get("new-arrivals")
    @ApiOperation({summary: "Get newest active product variants for homepage"})
    findNewArrivals(@Query("limit") limit?: string) {
        return this.productVariantService.findNewArrivals(limit ? Number(limit) : undefined)
    }

    @Get("bestsellers")
    @ApiOperation({summary: "Get bestselling active product variants for homepage"})
    findBestsellers(@Query("limit") limit?: string) {
        return this.productVariantService.findBestsellers(limit ? Number(limit) : undefined)
    }

    @Get("discounted")
    @ApiOperation({summary: "Get active discounted product variants for homepage"})
    findDiscounted(@Query("limit") limit?: string) {
        return this.productVariantService.findDiscounted(limit ? Number(limit) : undefined)
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

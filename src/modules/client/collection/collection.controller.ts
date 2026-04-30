import {Controller, Get, Param, Query} from "@nestjs/common"
import {ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger"
import {ClientCollectionService} from "./collection.service"
import {CollectionEntity} from "../../admin/collection/entities/collection.entity"

@ApiTags("Collections")
@Controller("product/collections")
export class ClientCollectionController {
    constructor(private readonly collectionService: ClientCollectionService) {}

    @Get()
    @ApiOperation({summary: "Get collections that have active products"})
    @ApiResponse({status: 200, type: CollectionEntity, isArray: true})
    findAllWithProducts() {
        return this.collectionService.findAllWithProducts()
    }

    @Get(":id")
    @ApiOperation({summary: "Get collection details with active product variants"})
    findOne(@Param("id") id: string, @Query("page") page?: string, @Query("pageSize") pageSize?: string) {
        return this.collectionService.findOneWithProducts(
            +id,
            page ? Number(page) : undefined,
            pageSize ? Number(pageSize) : undefined
        )
    }

    @Get(":id/variants")
    @ApiOperation({summary: "Get active product variants by collection"})
    findVariants(@Param("id") id: string, @Query("page") page?: string, @Query("pageSize") pageSize?: string) {
        return this.collectionService.findProductsByCollection(
            +id,
            page ? Number(page) : undefined,
            pageSize ? Number(pageSize) : undefined
        )
    }
}

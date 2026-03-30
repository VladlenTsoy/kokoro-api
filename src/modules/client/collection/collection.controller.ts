import {Controller, Get} from "@nestjs/common"
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
}

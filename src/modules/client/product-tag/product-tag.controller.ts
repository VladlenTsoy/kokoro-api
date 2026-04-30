import {Controller, Get, Query} from "@nestjs/common"
import {ApiOperation, ApiQuery, ApiTags} from "@nestjs/swagger"
import {ClientProductTagService} from "./product-tag.service"
import {ProductTagType} from "../../admin/product-tag/entities/product-tag.entity"

@ApiTags("Product Tags")
@Controller("product/tags")
export class ClientProductTagController {
    constructor(private readonly productTagService: ClientProductTagService) {}

    @Get()
    @ApiOperation({summary: "Get active product tags for client filters"})
    @ApiQuery({name: "type", enum: ProductTagType, required: false})
    findAll(@Query("type") type?: ProductTagType) {
        return this.productTagService.findAll(type)
    }
}

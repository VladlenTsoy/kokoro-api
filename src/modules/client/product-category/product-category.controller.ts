import {Controller, Get} from "@nestjs/common"
import {ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger"
import {ProductCategoryEntity} from "../../admin/product-category/entities/product-category.entity"
import {ClientProductCategoryService} from "./product-category.service"

@ApiTags("Product Categories")
@Controller("product/categories")
export class ClientProductCategoryController {
    constructor(private readonly productCategoryService: ClientProductCategoryService) {}

    @Get("with-subcategories")
    @ApiOperation({summary: "Get product categories with sub categories for client"})
    @ApiResponse({
        status: 200,
        description: "List of product categories with sub categories",
        type: ProductCategoryEntity,
        isArray: true
    })
    findAllWithSubCategories() {
        return this.productCategoryService.findAllWithSubCategories()
    }
}

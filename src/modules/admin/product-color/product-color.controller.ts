import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UsePipes,
    ValidationPipe
} from "@nestjs/common"
import {ProductColorService} from "./services/product-color.service"
import {CreateProductColorDto} from "./dto/create-product-color.dto"
import {UpdateProductColorDto} from "./dto/update-product-color.dto"
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiResponse,
    ApiTags
} from "@nestjs/swagger"
import {ProductColorEntity} from "./entities/product-color.entity"

@ApiBearerAuth()
@ApiTags("Product Colors")
@Controller("admin/product-color")
export class ProductColorController {
    constructor(private readonly productColorService: ProductColorService) {}

    @Post()
    @ApiOperation({summary: "Create product color"})
    @ApiBody({type: CreateProductColorDto})
    @UsePipes(new ValidationPipe({transform: true}))
    @ApiResponse({
        status: 200,
        description: "New color created",
        type: ProductColorEntity
    })
    create(@Body() createProductColorDto: CreateProductColorDto) {
        return this.productColorService.create(createProductColorDto)
    }

    @Get()
    findAll() {
        return this.productColorService.findAll()
    }

    @Get(":id")
    findOne(@Param("id") id: string) {
        return this.productColorService.findOne(+id)
    }

    @Patch(":id")
    update(
        @Param("id") id: string,
        @Body() updateProductColorDto: UpdateProductColorDto
    ) {
        return this.productColorService.update(+id, updateProductColorDto)
    }

    @Delete(":id")
    remove(@Param("id") id: string) {
        // return this.productColorService.remove(+id)
    }
}

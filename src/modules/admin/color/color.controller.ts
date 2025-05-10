import {Body, Controller, Delete, Get, Param, Patch, Post, UsePipes, ValidationPipe} from "@nestjs/common"
import {ColorService} from "./color.service"
import {CreateColorDto} from "./dto/create-color.dto"
import {UpdateColorDto} from "./dto/update-color.dto"
import {ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger"
import {ColorEntity} from "./entities/color.entity"

@ApiBearerAuth()
@ApiTags("Colors")
@Controller("admin/color")
export class ColorController {
    constructor(private readonly colorService: ColorService) {}

    @Post()
    @ApiOperation({summary: "Create color"})
    @ApiBody({type: CreateColorDto})
    @ApiResponse({
        status: 200,
        description: "New color created",
        type: ColorEntity
    })
    @UsePipes(new ValidationPipe({transform: true}))
    create(@Body() createColorDto: CreateColorDto) {
        return this.colorService.create(createColorDto)
    }

    @Get()
    @ApiOperation({summary: "Get all colors"})
    @ApiResponse({
        status: 200,
        description: "List of all colors",
        type: ColorEntity,
        isArray: true
    })
    findAll() {
        return this.colorService.findAll()
    }

    @Get(":id")
    @ApiOperation({summary: "Get color by id"})
    @ApiResponse({
        status: 200,
        description: "Color by id",
        type: ColorEntity
    })
    findOne(@Param("id") id: string) {
        return this.colorService.findOne(+id)
    }

    @Patch(":id")
    @ApiOperation({summary: "Update color by id"})
    @ApiBody({type: UpdateColorDto})
    @ApiResponse({
        status: 200,
        description: "Updated color by id",
        type: ColorEntity
    })
    @UsePipes(new ValidationPipe({transform: true}))
    update(@Param("id") id: string, @Body() updateColorDto: UpdateColorDto) {
        return this.colorService.update(+id, updateColorDto)
    }

    @Delete(":id")
    @ApiOperation({summary: "Delete color by id"})
    @ApiResponse({
        status: 200,
        description: "Deleted color by id"
    })
    remove(@Param("id") id: string) {
        return this.colorService.remove(+id)
    }
}

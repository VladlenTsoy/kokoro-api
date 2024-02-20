import {Body, Controller, Delete, Get, Param, Patch, Post, UsePipes, ValidationPipe} from "@nestjs/common"
import {SizeService} from "./size.service"
import {CreateSizeDto} from "./dto/create-size.dto"
import {UpdateSizeDto} from "./dto/update-size.dto"
import {ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger"
import {SizeEntity} from "./entities/size.entity"

@ApiBearerAuth()
@ApiTags("Size")
@Controller("admin/size")
export class SizeController {
    constructor(private readonly sizeService: SizeService) {
    }

    @Post()
    @ApiOperation({summary: "Create size"})
    @ApiBody({type: CreateSizeDto})
    @ApiResponse({
        status: 200,
        description: "New color created",
        type: SizeEntity
    })
    @UsePipes(new ValidationPipe({transform: true}))
    create(@Body() createSizeDto: CreateSizeDto) {
        return this.sizeService.create(createSizeDto)
    }

    @Get()
    @ApiOperation({summary: "Get all sizes"})
    @ApiResponse({
        status: 200,
        description: "List of all sizes",
        type: SizeEntity,
        isArray: true
    })
    findAll() {
        return this.sizeService.findAll()
    }

    @Get(":id")
    @ApiOperation({summary: "Get size by id"})
    @ApiResponse({
        status: 200,
        description: "Size by id",
        type: SizeEntity,
    })
    findOne(@Param("id") id: string) {
        return this.sizeService.findOne(+id)
    }

    @Patch(":id")
    @ApiOperation({summary: "Update size by id"})
    @ApiBody({type: UpdateSizeDto})
    @ApiResponse({
        status: 200,
        description: "Updated size by id",
        type: SizeEntity,
    })
    @UsePipes(new ValidationPipe({transform: true}))
    update(@Param("id") id: string, @Body() updateSizeDto: UpdateSizeDto) {
        return this.sizeService.update(+id, updateSizeDto)
    }

    @Delete(":id")
    @ApiOperation({summary: "Delete size by id"})
    @ApiResponse({
        status: 200,
        description: "Deleted size by id"
    })
    remove(@Param("id") id: string) {
        return this.sizeService.remove(+id)
    }
}

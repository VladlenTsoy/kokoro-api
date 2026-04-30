import {Body, Controller, Delete, Get, Param, Patch, Post, UsePipes, ValidationPipe} from "@nestjs/common"
import {ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger"
import {CollectionService} from "./collection.service"
import {CreateCollectionDto} from "./dto/create-collection.dto"
import {UpdateCollectionDto} from "./dto/update-collection.dto"
import {CollectionEntity} from "./entities/collection.entity"

@ApiTags("Collections")
@ApiBearerAuth("admin-bearer")
@Controller("admin/collections")
export class CollectionController {
    constructor(private readonly collectionService: CollectionService) {}

    @Post()
    @ApiOperation({summary: "Create collection"})
    @ApiBody({type: CreateCollectionDto})
    @ApiResponse({status: 200, type: CollectionEntity})
    @UsePipes(new ValidationPipe({transform: true}))
    create(@Body() createCollectionDto: CreateCollectionDto) {
        return this.collectionService.create(createCollectionDto)
    }

    @Get()
    @ApiOperation({summary: "Get all collections"})
    @ApiResponse({status: 200, type: CollectionEntity, isArray: true})
    findAll() {
        return this.collectionService.findAll()
    }

    @Get(":id")
    @ApiOperation({summary: "Get collection by id"})
    @ApiResponse({status: 200, type: CollectionEntity})
    findOne(@Param("id") id: string) {
        return this.collectionService.findOne(+id)
    }

    @Patch(":id")
    @ApiOperation({summary: "Update collection"})
    @ApiBody({type: UpdateCollectionDto})
    @ApiResponse({status: 200, type: CollectionEntity})
    @UsePipes(new ValidationPipe({transform: true}))
    update(@Param("id") id: string, @Body() updateCollectionDto: UpdateCollectionDto) {
        return this.collectionService.update(+id, updateCollectionDto)
    }

    @Delete(":id")
    @ApiOperation({summary: "Delete collection"})
    @ApiResponse({status: 200})
    remove(@Param("id") id: string) {
        return this.collectionService.remove(+id)
    }
}

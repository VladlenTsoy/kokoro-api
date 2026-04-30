import {Body, Controller, Get, Param, Patch, Post, Query, UsePipes, ValidationPipe} from "@nestjs/common"
import {ApiBearerAuth, ApiOperation, ApiTags} from "@nestjs/swagger"
import {ClientService} from "./client.service"
import {FilterAdminClientsDto} from "./dto/filter-admin-clients.dto"
import {UpdateAdminClientDto} from "./dto/update-admin-client.dto"
import {MergeClientsDto} from "./dto/merge-clients.dto"

@ApiTags("Admin Clients")
@ApiBearerAuth("admin-bearer")
@UsePipes(new ValidationPipe({transform: true}))
@Controller("admin/clients")
export class ClientController {
    constructor(private readonly clientService: ClientService) {}

    @Get()
    @ApiOperation({summary: "Get clients list with commerce metrics"})
    findAll(@Query() query: FilterAdminClientsDto) {
        return this.clientService.findAll(query)
    }

    @Get(":id")
    @ApiOperation({summary: "Get client card"})
    findOne(@Param("id") id: string) {
        return this.clientService.findOne(+id)
    }

    @Patch(":id")
    @ApiOperation({summary: "Update client profile"})
    update(@Param("id") id: string, @Body() dto: UpdateAdminClientDto) {
        return this.clientService.update(+id, dto)
    }

    @Post(":id/block")
    @ApiOperation({summary: "Block client"})
    block(@Param("id") id: string) {
        return this.clientService.block(+id)
    }

    @Post(":id/unblock")
    @ApiOperation({summary: "Unblock client"})
    unblock(@Param("id") id: string) {
        return this.clientService.unblock(+id)
    }

    @Get(":id/orders")
    @ApiOperation({summary: "Get client orders"})
    orders(@Param("id") id: string, @Query("page") page?: string, @Query("pageSize") pageSize?: string) {
        return this.clientService.orders(+id, page ? Number(page) : 1, pageSize ? Number(pageSize) : 20)
    }

    @Get(":id/addresses")
    @ApiOperation({summary: "Get client addresses"})
    addresses(@Param("id") id: string) {
        return this.clientService.addresses(+id)
    }

    @Get(":id/bonus-transactions")
    @ApiOperation({summary: "Get client bonus transactions"})
    bonusTransactions(@Param("id") id: string) {
        return this.clientService.bonusTransactions(+id)
    }

    @Post("merge")
    @ApiOperation({summary: "Merge source client into target client"})
    merge(@Body() dto: MergeClientsDto) {
        return this.clientService.merge(dto)
    }
}

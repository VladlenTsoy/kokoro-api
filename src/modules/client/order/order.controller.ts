import {Body, Controller, Get, Param, Post, UseGuards, UsePipes, ValidationPipe} from "@nestjs/common"
import {ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger"
import {ClientOrderService} from "./order.service"
import {CreateClientOrderDto} from "./dto/create-client-order.dto"
import {ClientOptionalAuthGuard} from "../auth/guards/client-optional-auth.guard"
import {CurrentClient} from "../auth/decorators/current-client.decorator"
import {ClientAuthenticatedUser} from "../auth/types/client-authenticated-user.type"

@ApiTags("Client Orders")
@Controller("client/orders")
export class ClientOrderController {
    constructor(private readonly clientOrderService: ClientOrderService) {}

    @Post()
    @UseGuards(ClientOptionalAuthGuard)
    @ApiBearerAuth("client-bearer")
    @ApiOperation({summary: "Create order from client side (guest or authorized)"})
    @ApiBody({type: CreateClientOrderDto})
    @ApiResponse({status: 200, description: "Order has been successfully created"})
    @UsePipes(new ValidationPipe({transform: true}))
    create(@Body() createClientOrderDto: CreateClientOrderDto, @CurrentClient() clientUser: ClientAuthenticatedUser | null) {
        return this.clientOrderService.create(createClientOrderDto, clientUser?.id)
    }

    @Get(":id")
    @ApiOperation({summary: "Get client order by id"})
    @ApiResponse({status: 200, description: "Client order details"})
    findOne(@Param("id") id: string) {
        return this.clientOrderService.findOneForClient(+id)
    }
}

import {Body, Controller, Get, Param, Post, UsePipes, ValidationPipe} from "@nestjs/common"
import {ApiBody, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger"
import {ClientOrderService} from "./order.service"
import {CreateClientOrderDto} from "./dto/create-client-order.dto"

@ApiTags("Client Orders")
@Controller("client/orders")
export class ClientOrderController {
    constructor(private readonly clientOrderService: ClientOrderService) {}

    @Post()
    @ApiOperation({summary: "Create order from client side"})
    @ApiBody({type: CreateClientOrderDto})
    @ApiResponse({status: 200, description: "Order has been successfully created"})
    @UsePipes(new ValidationPipe({transform: true}))
    create(@Body() createClientOrderDto: CreateClientOrderDto) {
        return this.clientOrderService.create(createClientOrderDto)
    }

    @Get(":id")
    @ApiOperation({summary: "Get client order by id"})
    @ApiResponse({status: 200, description: "Client order details"})
    findOne(@Param("id") id: string) {
        return this.clientOrderService.findOneForClient(+id)
    }
}

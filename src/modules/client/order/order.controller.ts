import {Body, Controller, Get, Param, Post, Query, UseGuards, UsePipes, ValidationPipe} from "@nestjs/common"
import {ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger"
import {ClientOrderService} from "./order.service"
import {CreateClientOrderDto} from "./dto/create-client-order.dto"
import {ClientOptionalAuthGuard} from "../auth/guards/client-optional-auth.guard"
import {CurrentClient} from "../auth/decorators/current-client.decorator"
import {ClientAuthenticatedUser} from "../auth/types/client-authenticated-user.type"
import {ClientAuthGuard} from "../auth/guards/client-auth.guard"
import {ClientOrderAccessDto} from "./dto/client-order-access.dto"
import {CancelClientOrderDto} from "./dto/cancel-client-order.dto"
import {PaymeService} from "../../payme/payme.service"

@ApiTags("Client Orders")
@UsePipes(new ValidationPipe({transform: true}))
@Controller("client/orders")
export class ClientOrderController {
    constructor(
        private readonly clientOrderService: ClientOrderService,
        private readonly paymeService: PaymeService
    ) {}

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

    @Get()
    @UseGuards(ClientAuthGuard)
    @ApiBearerAuth("client-bearer")
    @ApiOperation({summary: "Get current client orders"})
    findAll(@CurrentClient() clientUser: ClientAuthenticatedUser, @Query("page") page?: string, @Query("pageSize") pageSize?: string) {
        return this.clientOrderService.findAllForClient(
            clientUser.id,
            page ? Number(page) : 1,
            pageSize ? Number(pageSize) : 20
        )
    }

    @Get(":id")
    @UseGuards(ClientOptionalAuthGuard)
    @ApiBearerAuth("client-bearer")
    @ApiOperation({summary: "Get client order by id"})
    @ApiResponse({status: 200, description: "Client order details"})
    findOne(
        @Param("id") id: string,
        @CurrentClient() clientUser: ClientAuthenticatedUser | null,
        @Query() query: ClientOrderAccessDto
    ) {
        return this.clientOrderService.findOneForClient(+id, clientUser?.id, query.accessToken)
    }

    @Post(":id/cancel")
    @UseGuards(ClientOptionalAuthGuard)
    @ApiBearerAuth("client-bearer")
    @ApiOperation({summary: "Cancel current client order while it is still new"})
    cancel(
        @Param("id") id: string,
        @CurrentClient() clientUser: ClientAuthenticatedUser | null,
        @Query() query: ClientOrderAccessDto,
        @Body() dto: CancelClientOrderDto
    ) {
        return this.clientOrderService.cancelForClient(+id, clientUser?.id, query.accessToken, dto.reason)
    }

    @Post(":id/reorder")
    @UseGuards(ClientAuthGuard)
    @ApiBearerAuth("client-bearer")
    @ApiOperation({summary: "Build reorder payload from previous order"})
    reorder(@Param("id") id: string, @CurrentClient() clientUser: ClientAuthenticatedUser) {
        return this.clientOrderService.reorder(+id, clientUser.id)
    }

    @Post(":id/payme-link")
    @UseGuards(ClientOptionalAuthGuard)
    @ApiBearerAuth("client-bearer")
    @ApiOperation({summary: "Create Payme checkout link for order"})
    createPaymeLink(
        @Param("id") id: string,
        @CurrentClient() clientUser: ClientAuthenticatedUser | null,
        @Query() query: ClientOrderAccessDto,
        @Query("lang") lang?: string
    ) {
        return this.paymeService.buildPaymentLink(+id, query.accessToken, clientUser?.id, lang || "ru")
    }
}

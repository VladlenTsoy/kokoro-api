import {Body, Controller, Get, Param, Patch, Post, Query, UsePipes, ValidationPipe} from "@nestjs/common"
import {ApiBearerAuth, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger"
import {OrderService} from "./order.service"
import {FilterAdminOrdersDto} from "./dto/filter-admin-orders.dto"
import {UpdateOrderStatusDto} from "./dto/update-order-status.dto"
import {CurrentAdmin} from "../auth/decorators/current-admin.decorator"
import {AdminAuthenticatedUser} from "../auth/types/admin-authenticated-user.type"
import {CreateOrderCommentDto} from "./dto/create-order-comment.dto"
import {CancelOrderDto} from "./dto/cancel-order.dto"
import {UpdateOrderDto} from "./dto/update-order.dto"

@ApiTags("Admin Orders")
@ApiBearerAuth("admin-bearer")
@UsePipes(new ValidationPipe({transform: true}))
@Controller("admin/orders")
export class AdminOrderController {
    constructor(private readonly orderService: OrderService) {}

    @Get()
    @ApiOperation({summary: "Get orders list for admin"})
    @ApiResponse({status: 200, description: "Paginated orders list"})
    findAll(@Query() query: FilterAdminOrdersDto) {
        return this.orderService.findAllForAdmin(query)
    }

    @Get("summary")
    @ApiOperation({summary: "Get orders dashboard summary"})
    summary() {
        return this.orderService.getAdminSummary()
    }

    @Get(":id")
    @ApiOperation({summary: "Get order card for admin"})
    findOne(@Param("id") id: string) {
        return this.orderService.findOne(+id)
    }

    @Patch(":id")
    @ApiOperation({summary: "Update order operational fields"})
    update(@Param("id") id: string, @Body() dto: UpdateOrderDto) {
        return this.orderService.update(+id, dto)
    }

    @Patch(":id/status")
    @ApiOperation({summary: "Change order status and write history"})
    updateStatus(
        @Param("id") id: string,
        @Body() dto: UpdateOrderStatusDto,
        @CurrentAdmin() admin: AdminAuthenticatedUser
    ) {
        return this.orderService.updateStatus(+id, dto, admin)
    }

    @Post(":id/cancel")
    @ApiOperation({summary: "Cancel order"})
    cancel(@Param("id") id: string, @Body() dto: CancelOrderDto, @CurrentAdmin() admin: AdminAuthenticatedUser) {
        return this.orderService.cancel(+id, dto, admin)
    }

    @Post(":id/comments")
    @ApiOperation({summary: "Add internal or client-visible order comment"})
    addComment(
        @Param("id") id: string,
        @Body() dto: CreateOrderCommentDto,
        @CurrentAdmin() admin: AdminAuthenticatedUser
    ) {
        return this.orderService.addComment(+id, dto, admin)
    }

    @Get(":id/history")
    @ApiOperation({summary: "Get order status history"})
    history(@Param("id") id: string) {
        return this.orderService.getHistory(+id)
    }
}

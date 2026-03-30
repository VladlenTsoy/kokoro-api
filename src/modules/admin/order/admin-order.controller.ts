import {Controller, Get, Query} from "@nestjs/common"
import {ApiBearerAuth, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger"
import {OrderService} from "./order.service"

@ApiTags("Admin Orders")
@ApiBearerAuth("admin-bearer")
@Controller("admin/orders")
export class AdminOrderController {
    constructor(private readonly orderService: OrderService) {}

    @Get()
    @ApiOperation({summary: "Get orders list for admin"})
    @ApiResponse({status: 200, description: "Paginated orders list"})
    findAll(@Query("page") page?: string, @Query("pageSize") pageSize?: string) {
        return this.orderService.findAllForAdmin(page ? Number(page) : 1, pageSize ? Number(pageSize) : 20)
    }
}

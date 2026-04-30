import {Body, Controller, Headers, Post} from "@nestjs/common"
import {ApiOperation, ApiTags} from "@nestjs/swagger"
import {Public} from "../admin/auth/decorators/public.decorator"
import {PaymeService} from "./payme.service"

@ApiTags("Payme")
@Public()
@Controller("payme")
export class PaymeController {
    constructor(private readonly paymeService: PaymeService) {}

    @Post()
    @ApiOperation({summary: "Payme Business Merchant API callback endpoint"})
    callback(@Body() body: any, @Headers("authorization") authorization?: string) {
        return this.paymeService.handleRpc(body, authorization)
    }
}

import {Body, Controller, Get, Param, ParseIntPipe, Post, Query} from "@nestjs/common"
import {ApiTags} from "@nestjs/swagger"
import {CurrentAdmin} from "../auth/decorators/current-admin.decorator"
import {AdminAuthenticatedUser} from "../auth/types/admin-authenticated-user.type"
import {ClosePosShiftDto} from "./dto/close-pos-shift.dto"
import {OpenPosShiftDto} from "./dto/open-pos-shift.dto"
import {PosService} from "./pos.service"

@ApiTags("Admin POS")
@Controller("admin/pos")
export class PosController {
    constructor(private readonly posService: PosService) {}

    @Get("session")
    session(@CurrentAdmin() admin: AdminAuthenticatedUser) {
        return this.posService.getSession(admin)
    }

    @Get("catalog")
    catalog(@CurrentAdmin() admin: AdminAuthenticatedUser, @Query("q") search?: string) {
        return this.posService.getCatalog(admin, search)
    }

    @Get("products/by-barcode/:code")
    productByBarcode(@Param("code") code: string, @CurrentAdmin() admin: AdminAuthenticatedUser) {
        return this.posService.findProductByBarcode(admin, code)
    }

    @Post("shifts/open")
    openShift(@Body() dto: OpenPosShiftDto, @CurrentAdmin() admin: AdminAuthenticatedUser) {
        return this.posService.openShift(dto, admin)
    }

    @Post("shifts/:id/close")
    closeShift(
        @Param("id", ParseIntPipe) id: number,
        @Body() dto: ClosePosShiftDto,
        @CurrentAdmin() admin: AdminAuthenticatedUser
    ) {
        return this.posService.closeShift(id, dto, admin)
    }

    @Get("shifts/:id/report")
    shiftReport(@Param("id", ParseIntPipe) id: number) {
        return this.posService.getShiftReport(id)
    }
}

import {Body, Controller, Delete, Get, Param, Patch, Post, UsePipes, ValidationPipe} from "@nestjs/common"
import {ApiBearerAuth, ApiOperation, ApiTags} from "@nestjs/swagger"
import {PromoCodeService} from "./promo-code.service"
import {CreatePromoCodeDto} from "./dto/create-promo-code.dto"
import {UpdatePromoCodeDto} from "./dto/update-promo-code.dto"

@ApiTags("Admin Promo Codes")
@ApiBearerAuth("admin-bearer")
@UsePipes(new ValidationPipe({transform: true}))
@Controller("admin/promo-codes")
export class PromoCodeController {
    constructor(private readonly promoCodeService: PromoCodeService) {}

    @Post()
    @ApiOperation({summary: "Create promo code"})
    create(@Body() dto: CreatePromoCodeDto) {
        return this.promoCodeService.create(dto)
    }

    @Get()
    @ApiOperation({summary: "Get promo codes"})
    findAll() {
        return this.promoCodeService.findAll()
    }

    @Get(":id")
    @ApiOperation({summary: "Get promo code"})
    findOne(@Param("id") id: string) {
        return this.promoCodeService.findOne(+id)
    }

    @Patch(":id")
    @ApiOperation({summary: "Update promo code"})
    update(@Param("id") id: string, @Body() dto: UpdatePromoCodeDto) {
        return this.promoCodeService.update(+id, dto)
    }

    @Delete(":id")
    @ApiOperation({summary: "Delete promo code"})
    remove(@Param("id") id: string) {
        return this.promoCodeService.remove(+id)
    }
}

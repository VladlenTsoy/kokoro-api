import {Module} from "@nestjs/common"
import {TypeOrmModule} from "@nestjs/typeorm"
import {PromoCodeEntity} from "./entities/promo-code.entity"
import {PromoCodeController} from "./promo-code.controller"
import {PromoCodeService} from "./promo-code.service"

@Module({
    imports: [TypeOrmModule.forFeature([PromoCodeEntity])],
    controllers: [PromoCodeController],
    providers: [PromoCodeService],
    exports: [PromoCodeService]
})
export class PromoCodeModule {}

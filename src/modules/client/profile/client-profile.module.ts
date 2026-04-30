import {Module} from "@nestjs/common"
import {TypeOrmModule} from "@nestjs/typeorm"
import {ClientProfileController} from "./client-profile.controller"
import {ClientProfileService} from "./client-profile.service"
import {ClientEntity} from "../../admin/client/entities/client.entity"
import {ClientAddressEntity} from "../../admin/client-address/entities/client-address.entity"
import {ClientAuthModule} from "../auth/client-auth.module"

@Module({
    imports: [ClientAuthModule, TypeOrmModule.forFeature([ClientEntity, ClientAddressEntity])],
    controllers: [ClientProfileController],
    providers: [ClientProfileService]
})
export class ClientProfileModule {}

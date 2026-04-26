import {Module} from "@nestjs/common"
import {TypeOrmModule} from "@nestjs/typeorm"
import {ClientAuthController} from "./client-auth.controller"
import {ClientAuthService} from "./client-auth.service"
import {ClientAuthCryptoService} from "./client-auth-crypto.service"
import {ClientEntity} from "../../admin/client/entities/client.entity"
import {ClientRefreshTokenEntity} from "./entities/client-refresh-token.entity"
import {ClientAuthGuard} from "./guards/client-auth.guard"
import {ClientOptionalAuthGuard} from "./guards/client-optional-auth.guard"

@Module({
    imports: [TypeOrmModule.forFeature([ClientEntity, ClientRefreshTokenEntity])],
    controllers: [ClientAuthController],
    providers: [ClientAuthService, ClientAuthCryptoService, ClientAuthGuard, ClientOptionalAuthGuard],
    exports: [ClientAuthCryptoService, ClientAuthGuard, ClientOptionalAuthGuard]
})
export class ClientAuthModule {}

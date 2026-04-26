import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from "@nestjs/common"
import {ClientAuthCryptoService} from "../client-auth-crypto.service"

@Injectable()
export class ClientOptionalAuthGuard implements CanActivate {
    constructor(private readonly clientAuthCryptoService: ClientAuthCryptoService) {}

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest()
        const authHeader = request.headers?.authorization

        if (!authHeader) return true
        if (typeof authHeader !== "string") {
            throw new UnauthorizedException("Invalid authorization header")
        }

        const [type, token] = authHeader.split(" ")
        if (type !== "Bearer" || !token) {
            throw new UnauthorizedException("Invalid authorization header format")
        }

        const payload = this.clientAuthCryptoService.verifyClientToken(token)
        if (!payload) {
            throw new UnauthorizedException("Invalid or expired access token")
        }

        request.clientUser = {
            id: payload.sub,
            telegramId: payload.telegramId
        }

        return true
    }
}

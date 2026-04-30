import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from "@nestjs/common"
import {Reflector} from "@nestjs/core"
import {AuthCryptoService} from "../auth-crypto.service"
import {IS_PUBLIC_KEY} from "../decorators/public.decorator"
import {ADMIN_PERMISSIONS_KEY} from "../decorators/permissions.decorator"
import {isAdminAccessPath} from "../permissions/admin-permissions"

@Injectable()
export class AdminAuthGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly authCryptoService: AuthCryptoService
    ) {}

    canActivate(context: ExecutionContext): boolean {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass()
        ])

        if (isPublic) return true

        const request = context.switchToHttp().getRequest()
        const requestPath = request.path || request.originalUrl || ""
        const hasAdminPermissions = this.reflector.getAllAndOverride<string[]>(ADMIN_PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass()
        ])

        if (!isAdminAccessPath(requestPath) && !hasAdminPermissions?.length) return true

        const authHeader = request.headers?.authorization
        if (!authHeader || typeof authHeader !== "string") {
            throw new UnauthorizedException("Authorization header is missing")
        }

        const [type, token] = authHeader.split(" ")
        if (type !== "Bearer" || !token) {
            throw new UnauthorizedException("Invalid authorization header format")
        }

        const payload = this.authCryptoService.verifyAdminToken(token)
        if (!payload) {
            throw new UnauthorizedException("Invalid or expired access token")
        }

        request.adminUser = {
            id: payload.sub,
            email: payload.email,
            firstName: payload.firstName,
            lastName: payload.lastName,
            roleCodes: payload.roles || [],
            permissions: payload.permissions || []
        }

        return true
    }
}

import {CanActivate, ExecutionContext, ForbiddenException, Injectable} from "@nestjs/common"
import {Reflector} from "@nestjs/core"
import {ROLES_KEY} from "../decorators/roles.decorator"
import {IS_PUBLIC_KEY} from "../decorators/public.decorator"

@Injectable()
export class AdminRolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass()
        ])

        if (isPublic) return true

        const request = context.switchToHttp().getRequest()
        const requestPath = request.path || request.originalUrl || ""

        if (!requestPath.includes("/admin")) return true

        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass()
        ])

        if (!requiredRoles || requiredRoles.length === 0) return true

        const userRoleCodes: string[] = request.adminUser?.roleCodes || []
        const allowed = requiredRoles.some((role) => userRoleCodes.includes(role))

        if (!allowed) {
            throw new ForbiddenException("Access denied: insufficient role")
        }

        return true
    }
}

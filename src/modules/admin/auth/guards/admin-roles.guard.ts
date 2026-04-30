import {CanActivate, ExecutionContext, ForbiddenException, Injectable} from "@nestjs/common"
import {Reflector} from "@nestjs/core"
import {ROLES_KEY} from "../decorators/roles.decorator"
import {IS_PUBLIC_KEY} from "../decorators/public.decorator"
import {ADMIN_PERMISSIONS_KEY} from "../decorators/permissions.decorator"
import {
    hasEveryAdminPermission,
    inferAdminPermissionFromRequest,
    isAdminAccessPath,
    isSuperAdmin
} from "../permissions/admin-permissions"
import {RoleService} from "../../role/role.service"

@Injectable()
export class AdminRolesGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly roleService: RoleService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass()
        ])

        if (isPublic) return true

        const request = context.switchToHttp().getRequest()
        const requestPath = request.path || request.originalUrl || ""

        const explicitPermissions = this.reflector.getAllAndOverride<string[]>(ADMIN_PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass()
        ])
        if (!isAdminAccessPath(requestPath) && !explicitPermissions?.length) return true

        const userRoleCodes: string[] = request.adminUser?.roleCodes || []
        if (isSuperAdmin(userRoleCodes)) return true

        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass()
        ])

        if (requiredRoles?.length && !requiredRoles.some((role) => userRoleCodes.includes(role))) {
            throw new ForbiddenException("Access denied: insufficient role")
        }

        const inferredPermission = inferAdminPermissionFromRequest(request)
        const requiredPermissions = explicitPermissions?.length ? explicitPermissions : inferredPermission ? [inferredPermission] : []

        if (!requiredPermissions.length) return true

        const freshPermissions = await this.roleService.getPermissionsForRoleCodes(userRoleCodes)
        const allowedByPermissions = hasEveryAdminPermission(freshPermissions, requiredPermissions)

        if (!allowedByPermissions) {
            throw new ForbiddenException(`Access denied: missing permission ${requiredPermissions.join(", ")}`)
        }

        return true
    }
}

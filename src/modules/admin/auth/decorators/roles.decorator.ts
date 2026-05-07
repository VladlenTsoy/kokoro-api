import {SetMetadata} from "@nestjs/common"

export const ROLES_KEY = "adminRoles"
export const Roles = (...roles: string[]) =>
    SetMetadata(
        ROLES_KEY,
        roles.map((role) => role.toUpperCase())
    )

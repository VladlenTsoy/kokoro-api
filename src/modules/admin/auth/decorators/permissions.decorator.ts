import {SetMetadata} from "@nestjs/common"
import {AdminPermissionCode} from "../permissions/admin-permissions"

export const ADMIN_PERMISSIONS_KEY = "adminPermissions"
export const AdminPermissions = (...permissions: AdminPermissionCode[]) => SetMetadata(ADMIN_PERMISSIONS_KEY, permissions)

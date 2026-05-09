import {Request} from "express"

export const ADMIN_PERMISSION_ACTIONS = ["read", "create", "update", "delete", "manage"] as const
export type AdminPermissionAction = (typeof ADMIN_PERMISSION_ACTIONS)[number]

export type AdminPermissionModuleCode =
    | "dashboard"
    | "orders"
    | "clients"
    | "catalog"
    | "marketing"
    | "settings"
    | "integrations"
    | "staff"
    | "files"

export type AdminPermissionCode = `${AdminPermissionModuleCode}.${AdminPermissionAction}`

export type AdminPermissionModule = {
    code: AdminPermissionModuleCode
    title: string
    description: string
    permissions: Array<{
        code: AdminPermissionCode
        action: AdminPermissionAction
        title: string
    }>
}

const ACTION_TITLES: Record<AdminPermissionAction, string> = {
    read: "Просмотр",
    create: "Создание",
    update: "Редактирование",
    delete: "Удаление",
    manage: "Полный доступ"
}

const MODULES: Array<Omit<AdminPermissionModule, "permissions">> = [
    {
        code: "dashboard",
        title: "Дашборд",
        description: "Сводки, метрики и стартовые экраны админки"
    },
    {
        code: "orders",
        title: "Заказы",
        description: "Заказы, статусы заказов, отмены, комментарии и история"
    },
    {
        code: "clients",
        title: "Клиенты",
        description: "Карточки клиентов, блокировки, адреса, бонусы и объединение дублей"
    },
    {
        code: "catalog",
        title: "Каталог",
        description: "Товары, варианты, категории, размеры, цвета, коллекции, склады и контент карточек"
    },
    {
        code: "marketing",
        title: "Маркетинг",
        description: "Промокоды, скидки и клиентские бонусные механики"
    },
    {
        code: "settings",
        title: "Настройки",
        description: "Доставка, оплаты, источники, города, точки продаж и системные справочники"
    },
    {
        code: "integrations",
        title: "Интеграции",
        description: "Платные интеграции, внешние CDP, Meta/Facebook и будущие провайдеры"
    },
    {
        code: "staff",
        title: "Сотрудники и роли",
        description: "Сотрудники, роли и назначение доступов"
    },
    {
        code: "files",
        title: "Файлы",
        description: "Загрузка и удаление изображений"
    }
]

export const ADMIN_PERMISSION_CATALOG: AdminPermissionModule[] = MODULES.map((module) => ({
    ...module,
    permissions: ADMIN_PERMISSION_ACTIONS.map((action) => ({
        code: `${module.code}.${action}` as AdminPermissionCode,
        action,
        title: ACTION_TITLES[action]
    }))
}))

export const ALL_ADMIN_PERMISSION_CODES = ADMIN_PERMISSION_CATALOG.flatMap((module) =>
    module.permissions.map((permission) => permission.code)
)

const ALL_ADMIN_PERMISSION_CODE_SET = new Set<string>(ALL_ADMIN_PERMISSION_CODES)

const LEGACY_ADMIN_PREFIXES = [
    "/cities",
    "/delivery-types",
    "/sources",
    "/product-storages",
    "/product-variant-discounts",
    "/product-variant-measurements"
]

function normalizePath(path: string) {
    const pathname = path.split("?")[0] || ""
    return pathname.replace(/^\/api(?=\/|$)/, "") || "/"
}

export function normalizeAdminPermissions(permissions?: string[] | null) {
    const normalized = Array.from(
        new Set((permissions || []).map((permission) => permission.trim().toLowerCase()).filter(Boolean))
    )
    const invalidPermissions = normalized.filter((permission) => !ALL_ADMIN_PERMISSION_CODE_SET.has(permission))

    return {
        permissions: normalized.filter((permission) =>
            ALL_ADMIN_PERMISSION_CODE_SET.has(permission)
        ) as AdminPermissionCode[],
        invalidPermissions
    }
}

export function isSuperAdmin(roleCodes?: string[] | null) {
    return (roleCodes || []).some((roleCode) => roleCode.toUpperCase() === "SUPER_ADMIN")
}

export function hasAdminPermission(permissionCodes: string[], requiredPermission: string) {
    const [moduleCode, action] = requiredPermission.split(".")
    if (!moduleCode || !action) return false

    const permissions = new Set(permissionCodes.map((permission) => permission.toLowerCase()))
    return permissions.has(requiredPermission.toLowerCase()) || permissions.has(`${moduleCode}.manage`)
}

export function hasEveryAdminPermission(permissionCodes: string[], requiredPermissions: string[]) {
    return requiredPermissions.every((permission) => hasAdminPermission(permissionCodes, permission))
}

function actionFromMethod(method: string): AdminPermissionAction {
    switch (method.toUpperCase()) {
        case "GET":
        case "HEAD":
        case "OPTIONS":
            return "read"
        case "POST":
            return "create"
        case "PATCH":
        case "PUT":
            return "update"
        case "DELETE":
            return "delete"
        default:
            return "read"
    }
}

function moduleFromPath(path: string): AdminPermissionModuleCode | null {
    if (path.startsWith("/admin/auth")) return null
    if (path.startsWith("/admin/orders")) return "orders"
    if (path.startsWith("/admin/clients")) return "clients"
    if (path.startsWith("/admin/promo-codes")) return "marketing"
    if (path.startsWith("/admin/integrations")) return "integrations"
    if (path.startsWith("/admin/search-zero-results")) return "catalog"
    if (path.startsWith("/admin/image")) return "files"
    if (path.startsWith("/admin/roles") || path.startsWith("/admin/employees")) return "staff"
    if (
        path.startsWith("/admin/product") ||
        path.startsWith("/admin/color") ||
        path.startsWith("/admin/size") ||
        path.startsWith("/admin/collections") ||
        path.startsWith("/product-storages") ||
        path.startsWith("/product-variant-discounts") ||
        path.startsWith("/product-variant-measurements")
    ) {
        return "catalog"
    }
    if (
        path.startsWith("/admin/countries") ||
        path.startsWith("/admin/sales-points") ||
        path.startsWith("/admin/product-variant-status") ||
        path.startsWith("/cities") ||
        path.startsWith("/delivery-types") ||
        path.startsWith("/sources")
    ) {
        return "settings"
    }

    return null
}

export function isAdminAccessPath(path: string) {
    const normalizedPath = normalizePath(path)
    return (
        normalizedPath.startsWith("/admin") || LEGACY_ADMIN_PREFIXES.some((prefix) => normalizedPath.startsWith(prefix))
    )
}

export function inferAdminPermissionFromRequest(request: Request): AdminPermissionCode | null {
    const normalizedPath = normalizePath(request.path || request.originalUrl || "")
    const moduleCode = moduleFromPath(normalizedPath)
    if (!moduleCode) return null

    let action = actionFromMethod(request.method || "GET")

    if (normalizedPath === "/admin/product-variant/all") action = "read"
    if (normalizedPath.includes("/cancel") || normalizedPath.includes("/status") || normalizedPath.includes("/roles"))
        action = "update"
    if (normalizedPath.endsWith("/merge") || normalizedPath.includes("/block") || normalizedPath.includes("/unblock"))
        action = "update"

    return `${moduleCode}.${action}` as AdminPermissionCode
}

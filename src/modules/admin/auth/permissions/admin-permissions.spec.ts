import {
    hasAdminPermission,
    inferAdminPermissionFromRequest,
    isAdminAccessPath,
    normalizeAdminPermissions
} from "./admin-permissions"

describe("admin permissions", () => {
    it("normalizes and validates permission codes", () => {
        const result = normalizeAdminPermissions(["Orders.Read", " orders.read ", "clients.update", "missing.read"])

        expect(result.permissions).toEqual(["orders.read", "clients.update"])
        expect(result.invalidPermissions).toEqual(["missing.read"])
    })

    it("treats module manage permission as wildcard", () => {
        expect(hasAdminPermission(["orders.manage"], "orders.read")).toBe(true)
        expect(hasAdminPermission(["orders.manage"], "orders.delete")).toBe(true)
        expect(hasAdminPermission(["clients.manage"], "orders.read")).toBe(false)
    })

    it("detects admin and legacy admin paths", () => {
        expect(isAdminAccessPath("/api/admin/orders")).toBe(true)
        expect(isAdminAccessPath("/api/product/variants")).toBe(false)
        expect(isAdminAccessPath("/api/delivery-types")).toBe(true)
    })

    it("infers module action permission from request", () => {
        expect(
            inferAdminPermissionFromRequest({
                path: "/api/admin/orders",
                method: "GET"
            } as any)
        ).toBe("orders.read")

        expect(
            inferAdminPermissionFromRequest({
                path: "/api/admin/product-variant/all",
                method: "POST"
            } as any)
        ).toBe("catalog.read")

        expect(
            inferAdminPermissionFromRequest({
                path: "/api/admin/clients/12/block",
                method: "POST"
            } as any)
        ).toBe("clients.update")
    })
})

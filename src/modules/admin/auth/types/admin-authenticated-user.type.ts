export type AdminAuthenticatedUser = {
    id: number
    email: string
    firstName: string
    lastName: string
    roleCodes: string[]
    permissions: string[]
}

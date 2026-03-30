import {createParamDecorator, ExecutionContext} from "@nestjs/common"
import {AdminAuthenticatedUser} from "../types/admin-authenticated-user.type"

export const CurrentAdmin = createParamDecorator((_: unknown, context: ExecutionContext): AdminAuthenticatedUser => {
    const request = context.switchToHttp().getRequest()
    return request.adminUser
})

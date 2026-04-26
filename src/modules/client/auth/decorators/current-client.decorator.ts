import {createParamDecorator, ExecutionContext} from "@nestjs/common"
import {ClientAuthenticatedUser} from "../types/client-authenticated-user.type"

export const CurrentClient = createParamDecorator(
    (_: unknown, context: ExecutionContext): ClientAuthenticatedUser | null => {
        const request = context.switchToHttp().getRequest()
        return request.clientUser || null
    }
)

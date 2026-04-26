import {Body, Controller, Get, Post, UseGuards, UsePipes, ValidationPipe} from "@nestjs/common"
import {ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger"
import {ClientAuthService} from "./client-auth.service"
import {LoginClientTelegramDto} from "./dto/login-client-telegram.dto"
import {RefreshClientTokenDto} from "./dto/refresh-client-token.dto"
import {LogoutClientDto} from "./dto/logout-client.dto"
import {ClientAuthGuard} from "./guards/client-auth.guard"
import {CurrentClient} from "./decorators/current-client.decorator"
import {ClientAuthenticatedUser} from "./types/client-authenticated-user.type"

@ApiTags("Client Auth")
@Controller("client/auth")
export class ClientAuthController {
    constructor(private readonly clientAuthService: ClientAuthService) {}

    @Post("telegram")
    @ApiOperation({summary: "Login or register client via Telegram payload"})
    @ApiBody({type: LoginClientTelegramDto})
    @ApiResponse({status: 200, description: "Login success"})
    @UsePipes(new ValidationPipe({transform: true}))
    loginWithTelegram(@Body() loginClientTelegramDto: LoginClientTelegramDto) {
        return this.clientAuthService.loginWithTelegram(loginClientTelegramDto)
    }

    @Post("refresh")
    @ApiOperation({summary: "Refresh client access token pair"})
    @ApiBody({type: RefreshClientTokenDto})
    @ApiResponse({status: 200, description: "Refresh success"})
    @UsePipes(new ValidationPipe({transform: true}))
    refresh(@Body() refreshClientTokenDto: RefreshClientTokenDto) {
        return this.clientAuthService.refresh(refreshClientTokenDto.refreshToken)
    }

    @Post("logout")
    @ApiOperation({summary: "Logout client and revoke refresh token"})
    @ApiBody({type: LogoutClientDto})
    @ApiResponse({status: 200, description: "Logout success"})
    @UsePipes(new ValidationPipe({transform: true}))
    logout(@Body() logoutClientDto: LogoutClientDto) {
        return this.clientAuthService.logout(logoutClientDto.refreshToken)
    }

    @Get("me")
    @UseGuards(ClientAuthGuard)
    @ApiBearerAuth("client-bearer")
    @ApiOperation({summary: "Current client profile"})
    @ApiResponse({status: 200, description: "Current client data"})
    me(@CurrentClient() clientUser: ClientAuthenticatedUser) {
        return this.clientAuthService.me(clientUser.id)
    }
}

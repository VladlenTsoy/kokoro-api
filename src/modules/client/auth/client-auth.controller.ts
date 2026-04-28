import {Body, Controller, Get, Post, UseGuards, UsePipes, ValidationPipe} from "@nestjs/common"
import {ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger"
import {ClientAuthService} from "./client-auth.service"
import {RefreshClientTokenDto} from "./dto/refresh-client-token.dto"
import {LogoutClientDto} from "./dto/logout-client.dto"
import {ClientAuthGuard} from "./guards/client-auth.guard"
import {CurrentClient} from "./decorators/current-client.decorator"
import {ClientAuthenticatedUser} from "./types/client-authenticated-user.type"
import {SendClientPhoneCodeDto} from "./dto/send-client-phone-code.dto"
import {VerifyClientPhoneCodeDto} from "./dto/verify-client-phone-code.dto"

@ApiTags("Client Auth")
@Controller("client/auth")
export class ClientAuthController {
    constructor(private readonly clientAuthService: ClientAuthService) {}

    @Post("phone/send-code")
    @ApiOperation({summary: "Send client verification code via Telegram Gateway"})
    @ApiBody({type: SendClientPhoneCodeDto})
    @ApiResponse({status: 200, description: "Verification code has been sent"})
    @UsePipes(new ValidationPipe({transform: true}))
    sendPhoneCode(@Body() sendClientPhoneCodeDto: SendClientPhoneCodeDto) {
        return this.clientAuthService.sendPhoneCode(sendClientPhoneCodeDto)
    }

    @Post("phone/verify")
    @ApiOperation({summary: "Verify client phone code and issue token pair"})
    @ApiBody({type: VerifyClientPhoneCodeDto})
    @ApiResponse({status: 200, description: "Login success"})
    @UsePipes(new ValidationPipe({transform: true}))
    verifyPhoneCode(@Body() verifyClientPhoneCodeDto: VerifyClientPhoneCodeDto) {
        return this.clientAuthService.verifyPhoneCode(verifyClientPhoneCodeDto)
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

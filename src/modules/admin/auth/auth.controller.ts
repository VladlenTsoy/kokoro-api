import {Body, Controller, Get, Patch, Post, UsePipes, ValidationPipe} from "@nestjs/common"
import {ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger"
import {AuthService} from "./auth.service"
import {LoginAdminDto} from "./dto/login-admin.dto"
import {Public} from "./decorators/public.decorator"
import {CurrentAdmin} from "./decorators/current-admin.decorator"
import {AdminAuthenticatedUser} from "./types/admin-authenticated-user.type"
import {ChangePasswordDto} from "./dto/change-password.dto"
import {BootstrapAdminDto} from "./dto/bootstrap-admin.dto"
import {RefreshAdminTokenDto} from "./dto/refresh-admin-token.dto"
import {LogoutAdminDto} from "./dto/logout-admin.dto"

@ApiTags("Admin Auth")
@Controller("admin/auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    @Post("bootstrap")
    @ApiOperation({summary: "Bootstrap first super admin (only once)"})
    @ApiBody({type: BootstrapAdminDto})
    @ApiResponse({status: 200, description: "Bootstrap success"})
    @UsePipes(new ValidationPipe({transform: true}))
    bootstrap(@Body() bootstrapAdminDto: BootstrapAdminDto) {
        return this.authService.bootstrapAdmin(bootstrapAdminDto)
    }

    @Public()
    @Post("login")
    @ApiOperation({summary: "Admin login"})
    @ApiBody({type: LoginAdminDto})
    @ApiResponse({status: 200, description: "Login success"})
    @UsePipes(new ValidationPipe({transform: true}))
    login(@Body() loginAdminDto: LoginAdminDto) {
        return this.authService.login(loginAdminDto)
    }

    @Public()
    @Post("refresh")
    @ApiOperation({summary: "Refresh access token pair"})
    @ApiBody({type: RefreshAdminTokenDto})
    @ApiResponse({status: 200, description: "Refresh success"})
    @UsePipes(new ValidationPipe({transform: true}))
    refresh(@Body() refreshAdminTokenDto: RefreshAdminTokenDto) {
        return this.authService.refresh(refreshAdminTokenDto.refreshToken)
    }

    @Get("me")
    @ApiBearerAuth("admin-bearer")
    @ApiOperation({summary: "Current admin profile"})
    @ApiResponse({status: 200, description: "Current admin data"})
    me(@CurrentAdmin() adminUser: AdminAuthenticatedUser) {
        return this.authService.me(adminUser.id)
    }

    @Patch("change-password")
    @ApiBearerAuth("admin-bearer")
    @ApiOperation({summary: "Change current admin password"})
    @ApiBody({type: ChangePasswordDto})
    @ApiResponse({status: 200, description: "Password changed"})
    @UsePipes(new ValidationPipe({transform: true}))
    changePassword(@CurrentAdmin() adminUser: AdminAuthenticatedUser, @Body() changePasswordDto: ChangePasswordDto) {
        return this.authService.changePassword(adminUser.id, changePasswordDto.currentPassword, changePasswordDto.newPassword)
    }

    @Post("logout")
    @ApiBearerAuth("admin-bearer")
    @ApiOperation({summary: "Logout and revoke refresh token"})
    @ApiBody({type: LogoutAdminDto})
    @ApiResponse({status: 200, description: "Logout success"})
    @UsePipes(new ValidationPipe({transform: true}))
    logout(@Body() logoutAdminDto: LogoutAdminDto) {
        return this.authService.logout(logoutAdminDto.refreshToken)
    }
}

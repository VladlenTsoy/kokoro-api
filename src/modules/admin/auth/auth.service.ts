import {BadRequestException, ConflictException, Injectable, UnauthorizedException} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {IsNull, MoreThan, Repository} from "typeorm"
import {EmployeeService} from "../employee/employee.service"
import {AuthCryptoService} from "./auth-crypto.service"
import {LoginAdminDto} from "./dto/login-admin.dto"
import {BootstrapAdminDto} from "./dto/bootstrap-admin.dto"
import {RoleService} from "../role/role.service"
import {EmployeeEntity} from "../employee/entities/employee.entity"
import {AdminRefreshTokenEntity} from "./entities/admin-refresh-token.entity"
import {ALL_ADMIN_PERMISSION_CODES, isSuperAdmin} from "./permissions/admin-permissions"

@Injectable()
export class AuthService {
    constructor(
        private readonly employeeService: EmployeeService,
        private readonly authCryptoService: AuthCryptoService,
        private readonly roleService: RoleService,
        @InjectRepository(EmployeeEntity)
        private readonly employeeRepository: Repository<EmployeeEntity>,
        @InjectRepository(AdminRefreshTokenEntity)
        private readonly refreshTokenRepository: Repository<AdminRefreshTokenEntity>
    ) {}

    private buildTokenPayload(employee: EmployeeEntity) {
        const activeRoles = (employee.roles || []).filter((role) => role.isActive)
        const roleCodes = activeRoles.map((role) => role.code)
        const permissions = isSuperAdmin(roleCodes)
            ? ALL_ADMIN_PERMISSION_CODES
            : Array.from(new Set(activeRoles.flatMap((role) => role.permissions || [])))

        return {
            sub: employee.id,
            email: employee.email,
            firstName: employee.firstName,
            lastName: employee.lastName,
            roles: roleCodes,
            permissions
        }
    }

    private async issueRefreshToken(employee: EmployeeEntity) {
        const secret = this.authCryptoService.createRefreshTokenSecret()
        const tokenData = this.authCryptoService.hashPassword(secret)
        const expiresInDays = Number(process.env.ADMIN_REFRESH_TOKEN_EXPIRES_IN_DAYS || 30)
        const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)

        const refreshToken = this.refreshTokenRepository.create({
            employee,
            tokenHash: tokenData.hash,
            tokenSalt: tokenData.salt,
            expiresAt
        })

        const savedRefreshToken = await this.refreshTokenRepository.save(refreshToken)

        return {
            refreshToken: `${savedRefreshToken.id}.${secret}`,
            refreshTokenExpiresInDays: expiresInDays
        }
    }

    private async buildAuthResponse(employee: EmployeeEntity) {
        const safeEmployee = this.employeeService.sanitizeEmployee(employee)
        const accessToken = this.authCryptoService.signAdminToken(this.buildTokenPayload(employee))
        const refreshTokenData = await this.issueRefreshToken(employee)

        return {
            accessToken,
            tokenType: "Bearer",
            expiresInMinutes: Number(process.env.ADMIN_TOKEN_EXPIRES_IN_MINUTES || 60 * 8),
            refreshToken: refreshTokenData.refreshToken,
            refreshTokenExpiresInDays: refreshTokenData.refreshTokenExpiresInDays,
            employee: safeEmployee
        }
    }

    private parseRefreshToken(rawRefreshToken: string) {
        const [tokenIdPart, secret] = rawRefreshToken.split(".")
        const tokenId = Number(tokenIdPart)

        if (!tokenId || !secret) {
            throw new UnauthorizedException("Invalid refresh token format")
        }

        return {tokenId, secret}
    }

    async login(loginAdminDto: LoginAdminDto) {
        const employee = await this.employeeService.findOneWithSecretsByEmail(loginAdminDto.email)

        if (!employee || !employee.isActive) {
            throw new UnauthorizedException("Invalid email or password")
        }

        const isValidPassword = this.authCryptoService.verifyPassword(
            loginAdminDto.password,
            employee.passwordSalt,
            employee.passwordHash
        )

        if (!isValidPassword) {
            throw new UnauthorizedException("Invalid email or password")
        }

        return await this.buildAuthResponse(employee)
    }

    async me(employeeId: number) {
        const employee = await this.employeeService.findOneWithSecretsById(employeeId)
        if (!employee || !employee.isActive) {
            throw new UnauthorizedException("Employee is not active")
        }

        return this.employeeService.sanitizeEmployee(employee)
    }

    async changePassword(employeeId: number, currentPassword: string, newPassword: string) {
        if (currentPassword === newPassword) {
            throw new BadRequestException("New password must be different from current password")
        }

        const employee = await this.employeeService.findOneWithSecretsById(employeeId)
        if (!employee || !employee.isActive) {
            throw new UnauthorizedException("Employee is not active")
        }

        const isValidPassword = this.authCryptoService.verifyPassword(
            currentPassword,
            employee.passwordSalt,
            employee.passwordHash
        )

        if (!isValidPassword) {
            throw new UnauthorizedException("Current password is invalid")
        }

        const passwordData = this.authCryptoService.hashPassword(newPassword)
        employee.passwordHash = passwordData.hash
        employee.passwordSalt = passwordData.salt

        await this.employeeRepository.save(employee)

        return {message: "Password has been successfully changed"}
    }

    async bootstrapAdmin(bootstrapAdminDto: BootstrapAdminDto) {
        const employeeCount = await this.employeeRepository.count()
        if (employeeCount > 0) {
            throw new ConflictException("Bootstrap is already completed")
        }

        let superAdminRole = await this.roleService.findByCode("SUPER_ADMIN")
        if (!superAdminRole) {
            superAdminRole = await this.roleService.create({
                code: "SUPER_ADMIN",
                name: "Super Admin",
                isActive: true
            })
        }

        const employee = await this.employeeService.create({
            ...bootstrapAdminDto,
            roleIds: [superAdminRole.id],
            isActive: true
        })

        const employeeWithSecrets = await this.employeeService.findOneWithSecretsByEmail(employee.email)
        if (!employeeWithSecrets) {
            throw new ConflictException("Unable to create bootstrap admin")
        }

        return await this.buildAuthResponse(employeeWithSecrets)
    }

    async refresh(rawRefreshToken: string) {
        const {tokenId, secret} = this.parseRefreshToken(rawRefreshToken)

        const existingRefreshToken = await this.refreshTokenRepository.findOne({
            where: {
                id: tokenId,
                revokedAt: IsNull(),
                expiresAt: MoreThan(new Date())
            },
            relations: {employee: {roles: true}}
        })

        if (!existingRefreshToken?.employee || !existingRefreshToken.employee.isActive) {
            throw new UnauthorizedException("Invalid refresh token")
        }

        const isValid = this.authCryptoService.verifyPassword(
            secret,
            existingRefreshToken.tokenSalt,
            existingRefreshToken.tokenHash
        )

        if (!isValid) {
            throw new UnauthorizedException("Invalid refresh token")
        }

        existingRefreshToken.revokedAt = new Date()
        await this.refreshTokenRepository.save(existingRefreshToken)

        return await this.buildAuthResponse(existingRefreshToken.employee)
    }

    async logout(rawRefreshToken: string) {
        const {tokenId, secret} = this.parseRefreshToken(rawRefreshToken)

        const existingRefreshToken = await this.refreshTokenRepository.findOneBy({
            id: tokenId,
            revokedAt: IsNull()
        })

        if (!existingRefreshToken) {
            return {message: "Logged out"}
        }

        const isValid = this.authCryptoService.verifyPassword(
            secret,
            existingRefreshToken.tokenSalt,
            existingRefreshToken.tokenHash
        )

        if (!isValid) {
            throw new UnauthorizedException("Invalid refresh token")
        }

        existingRefreshToken.revokedAt = new Date()
        await this.refreshTokenRepository.save(existingRefreshToken)

        return {message: "Logged out"}
    }
}

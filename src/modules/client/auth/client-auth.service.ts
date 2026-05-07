import {
    BadGatewayException,
    BadRequestException,
    HttpException,
    HttpStatus,
    Injectable,
    UnauthorizedException
} from "@nestjs/common"
import {ConfigService} from "@nestjs/config"
import {InjectRepository} from "@nestjs/typeorm"
import {IsNull, MoreThan, Repository} from "typeorm"
import {ClientEntity} from "../../admin/client/entities/client.entity"
import {ClientAuthCryptoService} from "./client-auth-crypto.service"
import {ClientRefreshTokenEntity} from "./entities/client-refresh-token.entity"
import {ClientPhoneVerificationEntity} from "./entities/client-phone-verification.entity"
import {SendClientPhoneCodeDto} from "./dto/send-client-phone-code.dto"
import {VerifyClientPhoneCodeDto} from "./dto/verify-client-phone-code.dto"

type TelegramGatewayResponse = {
    ok: boolean
    result?: {
        request_id: string
        phone_number: string
        request_cost?: number
        remaining_balance?: number
        delivery_status?: {status: string; updated_at: number}
        verification_status?: {status: string; updated_at: number; code_entered?: string}
        payload?: string
    }
    error?: string
}

@Injectable()
export class ClientAuthService {
    constructor(
        private readonly configService: ConfigService,
        private readonly clientAuthCryptoService: ClientAuthCryptoService,
        @InjectRepository(ClientEntity)
        private readonly clientRepository: Repository<ClientEntity>,
        @InjectRepository(ClientRefreshTokenEntity)
        private readonly refreshTokenRepository: Repository<ClientRefreshTokenEntity>,
        @InjectRepository(ClientPhoneVerificationEntity)
        private readonly phoneVerificationRepository: Repository<ClientPhoneVerificationEntity>
    ) {}

    private sanitizeClient(client: ClientEntity) {
        return {
            id: client.id,
            name: client.name,
            phone: client.phone || null,
            bonusBalance: client.bonusBalance || 0,
            isActive: client.isActive,
            createdAt: client.createdAt,
            lastLoginAt: client.lastLoginAt || null
        }
    }

    private normalizePhone(phone: string) {
        return phone.replace(/\s+/g, "").trim()
    }

    private parseRefreshToken(rawRefreshToken: string) {
        const [tokenIdPart, secret] = rawRefreshToken.split(".")
        const tokenId = Number(tokenIdPart)

        if (!tokenId || !secret) {
            throw new UnauthorizedException("Invalid refresh token format")
        }

        return {tokenId, secret}
    }

    private async issueRefreshToken(client: ClientEntity) {
        const secret = this.clientAuthCryptoService.createRefreshTokenSecret()
        const tokenData = this.clientAuthCryptoService.hashSecret(secret)
        const expiresInDays = Number(process.env.CLIENT_REFRESH_TOKEN_EXPIRES_IN_DAYS || 60)
        const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)

        const refreshToken = this.refreshTokenRepository.create({
            client,
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

    private async buildAuthResponse(client: ClientEntity) {
        const accessToken = this.clientAuthCryptoService.signClientToken({
            sub: client.id,
            phone: client.phone || ""
        })
        const refreshTokenData = await this.issueRefreshToken(client)

        return {
            accessToken,
            tokenType: "Bearer",
            expiresInMinutes: Number(process.env.CLIENT_TOKEN_EXPIRES_IN_MINUTES || 60 * 24 * 7),
            refreshToken: refreshTokenData.refreshToken,
            refreshTokenExpiresInDays: refreshTokenData.refreshTokenExpiresInDays,
            client: this.sanitizeClient(client)
        }
    }

    private getGatewayToken() {
        const token = this.configService.get<string>("TELEGRAM_GATEWAY_API_TOKEN")
        if (!token) {
            throw new BadGatewayException("Telegram Gateway auth is not configured")
        }

        return token
    }

    private getGatewayTtlSeconds() {
        return Number(this.configService.get("TELEGRAM_GATEWAY_CODE_TTL_SECONDS", 600))
    }

    private async callTelegramGateway(
        method: "sendVerificationMessage" | "checkVerificationStatus",
        body: Record<string, any>
    ) {
        let response: Response
        try {
            response = await fetch(`https://gatewayapi.telegram.org/${method}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${this.getGatewayToken()}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            })
        } catch (err: any) {
            throw new BadGatewayException(`Telegram Gateway is unavailable: ${err?.message || "request failed"}`)
        }

        let data: TelegramGatewayResponse
        try {
            data = (await response.json()) as TelegramGatewayResponse
        } catch {
            throw new BadGatewayException(`Telegram Gateway returned invalid response with status ${response.status}`)
        }

        if (!response.ok || !data.ok || !data.result) {
            throw new BadGatewayException(
                data.error || `Telegram Gateway request failed with status ${response.status}`
            )
        }

        return data.result
    }

    async sendPhoneCode(dto: SendClientPhoneCodeDto) {
        const phone = this.normalizePhone(dto.phoneNumber)
        const ttlSeconds = this.getGatewayTtlSeconds()
        const now = new Date()

        const activeVerification = await this.phoneVerificationRepository.findOne({
            where: {
                phone,
                consumedAt: IsNull(),
                expiresAt: MoreThan(now)
            },
            order: {id: "DESC"}
        })

        if (activeVerification) {
            const retryAfterSeconds = Math.max(
                Math.ceil((activeVerification.expiresAt.getTime() - now.getTime()) / 1000),
                1
            )

            return {
                requestId: activeVerification.requestId,
                phoneNumber: phone,
                expiresInSeconds: retryAfterSeconds
            }
        }

        const result = await this.callTelegramGateway("sendVerificationMessage", {
            phone_number: phone,
            code_length: Number(this.configService.get("TELEGRAM_GATEWAY_CODE_LENGTH", 4)),
            ttl: ttlSeconds
        })

        const verification = this.phoneVerificationRepository.create({
            requestId: result.request_id,
            phone,
            status: result.delivery_status?.status || "sent",
            attempts: 0,
            expiresAt: new Date(Date.now() + ttlSeconds * 1000),
            gatewayResponse: result
        })
        await this.phoneVerificationRepository.save(verification)

        return {
            requestId: result.request_id,
            phoneNumber: phone,
            expiresInSeconds: ttlSeconds
        }
    }

    async verifyPhoneCode(dto: VerifyClientPhoneCodeDto) {
        const phone = this.normalizePhone(dto.phoneNumber)
        const verification = await this.phoneVerificationRepository.findOne({
            where: {
                requestId: dto.requestId,
                phone,
                consumedAt: IsNull(),
                expiresAt: MoreThan(new Date())
            }
        })

        if (!verification) {
            throw new BadRequestException("Verification request is invalid or expired")
        }

        const maxAttempts = Number(this.configService.get("TELEGRAM_GATEWAY_MAX_VERIFY_ATTEMPTS", 5))
        if (verification.attempts >= maxAttempts) {
            throw new HttpException("Maximum verification attempts exceeded", HttpStatus.TOO_MANY_REQUESTS)
        }

        verification.attempts += 1

        const result = await this.callTelegramGateway("checkVerificationStatus", {
            request_id: verification.requestId,
            code: dto.code
        })

        verification.status = result.verification_status?.status || verification.status
        verification.gatewayResponse = result

        if (verification.status !== "code_valid") {
            await this.phoneVerificationRepository.save(verification)
            throw new UnauthorizedException("Invalid verification code")
        }

        verification.consumedAt = new Date()
        await this.phoneVerificationRepository.save(verification)

        let client = await this.clientRepository.findOne({where: {phone}})
        if (!client) {
            client = this.clientRepository.create({
                name: dto.name?.trim() || phone,
                phone,
                lastLoginAt: new Date(),
                isActive: true
            })
        } else {
            if (dto.name?.trim()) {
                client.name = dto.name.trim()
            }
            client.lastLoginAt = new Date()
        }

        client = await this.clientRepository.save(client)

        if (!client.isActive) {
            throw new UnauthorizedException("Client is not active")
        }

        return await this.buildAuthResponse(client)
    }

    async me(clientId: number) {
        const client = await this.clientRepository.findOneBy({id: clientId})

        if (!client || !client.isActive) {
            throw new UnauthorizedException("Client is not active")
        }

        return this.sanitizeClient(client)
    }

    async refresh(rawRefreshToken: string) {
        const {tokenId, secret} = this.parseRefreshToken(rawRefreshToken)

        const existingRefreshToken = await this.refreshTokenRepository.findOne({
            where: {
                id: tokenId,
                revokedAt: IsNull(),
                expiresAt: MoreThan(new Date())
            },
            relations: {client: true}
        })

        if (!existingRefreshToken?.client || !existingRefreshToken.client.isActive) {
            throw new UnauthorizedException("Invalid refresh token")
        }

        const isValid = this.clientAuthCryptoService.verifySecret(
            secret,
            existingRefreshToken.tokenSalt,
            existingRefreshToken.tokenHash
        )

        if (!isValid) {
            throw new UnauthorizedException("Invalid refresh token")
        }

        existingRefreshToken.revokedAt = new Date()
        await this.refreshTokenRepository.save(existingRefreshToken)

        return await this.buildAuthResponse(existingRefreshToken.client)
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

        const isValid = this.clientAuthCryptoService.verifySecret(
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

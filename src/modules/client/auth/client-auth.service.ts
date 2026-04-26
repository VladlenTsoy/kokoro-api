import {Injectable, UnauthorizedException} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {IsNull, MoreThan, Repository} from "typeorm"
import {ClientEntity} from "../../admin/client/entities/client.entity"
import {ClientAuthCryptoService} from "./client-auth-crypto.service"
import {ClientRefreshTokenEntity} from "./entities/client-refresh-token.entity"
import {LoginClientTelegramDto} from "./dto/login-client-telegram.dto"

@Injectable()
export class ClientAuthService {
    constructor(
        private readonly clientAuthCryptoService: ClientAuthCryptoService,
        @InjectRepository(ClientEntity)
        private readonly clientRepository: Repository<ClientEntity>,
        @InjectRepository(ClientRefreshTokenEntity)
        private readonly refreshTokenRepository: Repository<ClientRefreshTokenEntity>
    ) {}

    private sanitizeClient(client: ClientEntity) {
        return {
            id: client.id,
            name: client.name,
            phone: client.phone || null,
            telegramId: client.telegramId || null,
            telegramUsername: client.telegramUsername || null,
            telegramFirstName: client.telegramFirstName || null,
            telegramLastName: client.telegramLastName || null,
            telegramPhotoUrl: client.telegramPhotoUrl || null,
            isActive: client.isActive,
            createdAt: client.createdAt,
            lastLoginAt: client.lastLoginAt || null
        }
    }

    private buildClientName(dto: LoginClientTelegramDto) {
        const fullName = [dto.first_name, dto.last_name].filter(Boolean).join(" ").trim()
        return fullName || dto.username || `telegram_${dto.id}`
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
            telegramId: client.telegramId || ""
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

    async loginWithTelegram(dto: LoginClientTelegramDto) {
        this.clientAuthCryptoService.verifyTelegramAuth(dto)

        let client = await this.clientRepository.findOne({where: {telegramId: dto.id}})

        if (!client) {
            client = this.clientRepository.create({
                name: this.buildClientName(dto),
                telegramId: dto.id,
                telegramUsername: dto.username || null,
                telegramFirstName: dto.first_name || null,
                telegramLastName: dto.last_name || null,
                telegramPhotoUrl: dto.photo_url || null,
                lastLoginAt: new Date(),
                isActive: true
            })
        } else {
            client.name = client.name || this.buildClientName(dto)
            client.telegramUsername = dto.username || null
            client.telegramFirstName = dto.first_name || null
            client.telegramLastName = dto.last_name || null
            client.telegramPhotoUrl = dto.photo_url || null
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

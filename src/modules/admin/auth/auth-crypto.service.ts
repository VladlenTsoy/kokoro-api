import {Injectable} from "@nestjs/common"
import {ConfigService} from "@nestjs/config"
import {createHmac, pbkdf2Sync, randomBytes, timingSafeEqual} from "crypto"

type AdminTokenPayload = {
    sub: number
    email: string
    firstName: string
    lastName: string
    roles: string[]
    permissions: string[]
    iat: number
    exp: number
}

@Injectable()
export class AuthCryptoService {
    constructor(private readonly configService: ConfigService) {}

    hashPassword(password: string, salt?: string) {
        const localSalt = salt || randomBytes(16).toString("hex")
        const iterations = Number(this.configService.get("ADMIN_PASSWORD_ITERATIONS", 210000))
        const hash = pbkdf2Sync(password, localSalt, iterations, 64, "sha512").toString("hex")

        return {hash, salt: localSalt}
    }

    verifyPassword(password: string, salt: string, expectedHash: string) {
        const passwordData = this.hashPassword(password, salt)
        const expectedBuffer = Buffer.from(expectedHash, "hex")
        const actualBuffer = Buffer.from(passwordData.hash, "hex")

        if (expectedBuffer.length !== actualBuffer.length) return false

        return timingSafeEqual(expectedBuffer, actualBuffer)
    }

    createRefreshTokenSecret() {
        return randomBytes(48).toString("base64url")
    }

    signAdminToken(input: Omit<AdminTokenPayload, "iat" | "exp">) {
        const now = Math.floor(Date.now() / 1000)
        const expiresInMinutes = Number(this.configService.get("ADMIN_TOKEN_EXPIRES_IN_MINUTES", 60 * 8))
        const payload: AdminTokenPayload = {
            ...input,
            iat: now,
            exp: now + expiresInMinutes * 60
        }

        const headerPart = this.base64UrlEncode(JSON.stringify({alg: "HS256", typ: "JWT"}))
        const payloadPart = this.base64UrlEncode(JSON.stringify(payload))
        const signature = this.createSignature(`${headerPart}.${payloadPart}`)

        return `${headerPart}.${payloadPart}.${signature}`
    }

    verifyAdminToken(token: string): AdminTokenPayload | null {
        const tokenParts = token.split(".")
        if (tokenParts.length !== 3) return null

        const [headerPart, payloadPart, signaturePart] = tokenParts
        const expectedSignature = this.createSignature(`${headerPart}.${payloadPart}`)

        if (signaturePart.length !== expectedSignature.length) return null
        if (!timingSafeEqual(Buffer.from(signaturePart), Buffer.from(expectedSignature))) return null

        try {
            const payload = JSON.parse(this.base64UrlDecode(payloadPart)) as AdminTokenPayload
            const now = Math.floor(Date.now() / 1000)

            if (payload.exp <= now) return null
            if (!payload.sub || !payload.email) return null

            return payload
        } catch {
            return null
        }
    }

    private createSignature(value: string) {
        return createHmac("sha256", this.getSecret()).update(value).digest("base64url")
    }

    private getSecret() {
        return this.configService.get<string>("ADMIN_AUTH_SECRET", "kokoro-change-me-admin-secret")
    }

    private base64UrlEncode(value: string) {
        return Buffer.from(value).toString("base64url")
    }

    private base64UrlDecode(value: string) {
        return Buffer.from(value, "base64url").toString("utf8")
    }
}

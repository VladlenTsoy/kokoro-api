import {Injectable} from "@nestjs/common"
import {ConfigService} from "@nestjs/config"
import {createCipheriv, createDecipheriv, createHash, randomBytes} from "crypto"

@Injectable()
export class IntegrationSecretService {
    constructor(private readonly configService: ConfigService) {}

    encryptJson(value: Record<string, unknown>) {
        const iv = randomBytes(12)
        const cipher = createCipheriv("aes-256-gcm", this.key(), iv)
        const encrypted = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()])
        const tag = cipher.getAuthTag()
        return [iv.toString("base64url"), tag.toString("base64url"), encrypted.toString("base64url")].join(".")
    }

    decryptJson(value?: string | null) {
        if (!value) return null
        const [ivPart, tagPart, encryptedPart] = value.split(".")
        if (!ivPart || !tagPart || !encryptedPart) return null

        const decipher = createDecipheriv("aes-256-gcm", this.key(), Buffer.from(ivPart, "base64url"))
        decipher.setAuthTag(Buffer.from(tagPart, "base64url"))
        const decrypted = Buffer.concat([
            decipher.update(Buffer.from(encryptedPart, "base64url")),
            decipher.final()
        ]).toString("utf8")

        return JSON.parse(decrypted) as Record<string, unknown>
    }

    private key() {
        const secret = this.configService.get<string>("INTEGRATION_SECRET") ||
            this.configService.get<string>("ADMIN_AUTH_SECRET", "kokoro-change-me-admin-secret")
        return createHash("sha256").update(secret).digest()
    }
}

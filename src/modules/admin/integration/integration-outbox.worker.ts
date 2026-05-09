import {Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {LessThanOrEqual, Repository} from "typeorm"
import {
    IntegrationBillingStatus,
    IntegrationProviderKey,
    IntegrationRuntimeStatus,
    IntegrationSettingEntity
} from "./entities/integration-setting.entity"
import {IntegrationOutboxEventEntity, IntegrationOutboxStatus} from "./entities/integration-outbox-event.entity"
import {IntegrationSecretService} from "./integration-secret.service"
import {DatraCdpAdapter} from "./datra-cdp.adapter"

const MAX_ATTEMPTS = 6
const BATCH_SIZE = 20
const POLL_INTERVAL_MS = 15_000

@Injectable()
export class IntegrationOutboxWorker implements OnApplicationBootstrap, OnApplicationShutdown {
    private readonly logger = new Logger(IntegrationOutboxWorker.name)
    private timer?: NodeJS.Timeout
    private running = false

    constructor(
        @InjectRepository(IntegrationOutboxEventEntity)
        private readonly outboxRepo: Repository<IntegrationOutboxEventEntity>,
        @InjectRepository(IntegrationSettingEntity)
        private readonly settingsRepo: Repository<IntegrationSettingEntity>,
        private readonly secretService: IntegrationSecretService,
        private readonly datraAdapter: DatraCdpAdapter
    ) {}

    onApplicationBootstrap() {
        this.timer = setInterval(() => void this.processBatch(), POLL_INTERVAL_MS)
        void this.processBatch()
    }

    onApplicationShutdown() {
        if (this.timer) clearInterval(this.timer)
    }

    async processBatch() {
        if (this.running) return
        this.running = true
        try {
            const dueEvents = await this.outboxRepo.find({
                where: [
                    {status: IntegrationOutboxStatus.PENDING},
                    {status: IntegrationOutboxStatus.FAILED, nextAttemptAt: LessThanOrEqual(new Date())}
                ],
                order: {createdAt: "ASC", id: "ASC"},
                take: BATCH_SIZE
            })

            for (const event of dueEvents) {
                await this.processEvent(event)
            }
        } catch (error) {
            this.logger.error(`Integration outbox batch failed: ${(error as Error).message}`)
        } finally {
            this.running = false
        }
    }

    private async processEvent(event: IntegrationOutboxEventEntity) {
        const attempt = event.attempts + 1
        try {
            const settings = await this.settingsRepo.findOneBy({providerKey: event.providerKey})
            if (!settings || !this.canSend(settings)) {
                event.status = IntegrationOutboxStatus.SKIPPED
                event.lastError = "Integration disabled, billing locked, or not configured"
                await this.outboxRepo.save(event)
                return
            }

            if (event.providerKey !== IntegrationProviderKey.DATRA_CDP) {
                event.status = IntegrationOutboxStatus.SKIPPED
                event.lastError = `Unsupported integration provider: ${event.providerKey}`
                await this.outboxRepo.save(event)
                return
            }

            const endpointUrl = this.resolveEndpoint(settings)
            const apiToken = this.resolveApiToken(settings)
            if (!endpointUrl || !apiToken) {
                event.status = IntegrationOutboxStatus.SKIPPED
                event.lastError = "Datra CDP endpoint or token is not configured"
                await this.outboxRepo.save(event)
                return
            }

            event.attempts = attempt
            event.lastError = null
            await this.outboxRepo.save(event)

            await this.datraAdapter.deliver(
                {endpointUrl, apiToken},
                {
                    providerKey: event.providerKey,
                    eventName: event.eventName,
                    eventId: event.eventId,
                    idempotencyKey: event.idempotencyKey,
                    payload: event.payload
                }
            )

            event.status = IntegrationOutboxStatus.SENT
            event.sentAt = new Date()
            event.nextAttemptAt = null
            event.lastError = null
            await this.outboxRepo.save(event)
        } catch (error) {
            const message = this.sanitizeError((error as Error).message)
            event.attempts = attempt
            event.status = attempt >= MAX_ATTEMPTS ? IntegrationOutboxStatus.DEAD : IntegrationOutboxStatus.FAILED
            event.lastError = message
            event.nextAttemptAt = event.status === IntegrationOutboxStatus.FAILED ? this.nextAttemptAt(attempt) : null
            await this.outboxRepo.save(event)
            this.logger.warn(`Integration event ${event.id} failed (${event.status}): ${message}`)
        }
    }

    private canSend(settings: IntegrationSettingEntity) {
        if (!settings.enabled || settings.runtimeStatus !== IntegrationRuntimeStatus.ENABLED) return false
        if (settings.isPaid && settings.billingStatus !== IntegrationBillingStatus.ACTIVE) return false
        if (settings.billingActiveUntil && settings.billingActiveUntil.getTime() <= Date.now()) return false
        return true
    }

    private resolveEndpoint(settings: IntegrationSettingEntity) {
        const publicConfig = settings.publicConfig || {}
        const value = publicConfig.endpointUrl || publicConfig.apiUrl || publicConfig.url
        return typeof value === "string" && value.trim() ? value.trim() : null
    }

    private resolveApiToken(settings: IntegrationSettingEntity) {
        const secrets = this.secretService.decryptJson(settings.secretConfigEncrypted)
        const value = secrets?.apiToken
        return typeof value === "string" && value.trim() ? value.trim() : null
    }

    private nextAttemptAt(attempt: number) {
        const delaySeconds = Math.min(60 * 60, 2 ** Math.max(attempt, 1) * 30)
        return new Date(Date.now() + delaySeconds * 1000)
    }

    private sanitizeError(message: string) {
        return message.replace(/Bearer\s+[A-Za-z0-9._~+\-/]+=*/gi, "Bearer <redacted>").slice(0, 1000)
    }
}

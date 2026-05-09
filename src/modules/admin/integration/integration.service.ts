import {BadRequestException, Injectable, Logger, NotFoundException} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {
    IntegrationBillingStatus,
    IntegrationProviderKey,
    IntegrationRuntimeStatus,
    IntegrationSettingEntity
} from "./entities/integration-setting.entity"
import {IntegrationOutboxEventEntity, IntegrationOutboxStatus} from "./entities/integration-outbox-event.entity"
import {UpdateIntegrationDto} from "./dto/update-integration.dto"
import {IntegrationSecretService} from "./integration-secret.service"

const DEFAULT_SCOPES = ["customers", "products", "categories", "branches", "orders", "order_statuses", "events"] as const

@Injectable()
export class IntegrationService {
    private readonly logger = new Logger(IntegrationService.name)

    constructor(
        @InjectRepository(IntegrationSettingEntity)
        private readonly settingsRepo: Repository<IntegrationSettingEntity>,
        @InjectRepository(IntegrationOutboxEventEntity)
        private readonly outboxRepo: Repository<IntegrationOutboxEventEntity>,
        private readonly secretService: IntegrationSecretService
    ) {}

    async list() {
        await this.ensureDefaults()
        const integrations = await this.settingsRepo.find({order: {id: "ASC"}})
        return integrations.map((integration) => this.toSafeDto(integration))
    }

    async findOne(providerKey: IntegrationProviderKey) {
        await this.ensureDefaults()
        const integration = await this.settingsRepo.findOneBy({providerKey})
        if (!integration) throw new NotFoundException("Integration not found")
        return this.toSafeDto(integration)
    }

    async update(providerKey: IntegrationProviderKey, dto: UpdateIntegrationDto) {
        await this.ensureDefaults()
        const integration = await this.settingsRepo.findOneBy({providerKey})
        if (!integration) throw new NotFoundException("Integration not found")

        if (dto.billingStatus !== undefined) integration.billingStatus = dto.billingStatus
        if (dto.billingActiveUntil !== undefined) {
            integration.billingActiveUntil = dto.billingActiveUntil ? new Date(dto.billingActiveUntil) : null
        }
        if (dto.enabledScopes !== undefined) integration.enabledScopes = dto.enabledScopes
        if (dto.publicConfig !== undefined) integration.publicConfig = dto.publicConfig
        if (dto.apiToken !== undefined && dto.apiToken.trim()) {
            integration.secretConfigEncrypted = this.secretService.encryptJson({apiToken: dto.apiToken.trim()})
        }

        if (dto.enabled !== undefined) {
            if (dto.enabled) this.assertCanEnable(integration)
            integration.enabled = dto.enabled
            integration.runtimeStatus = dto.enabled ? IntegrationRuntimeStatus.ENABLED : IntegrationRuntimeStatus.DISABLED
            integration.enabledAt = dto.enabled ? new Date() : null
        }

        if (dto.runtimeStatus !== undefined) {
            if (dto.runtimeStatus === IntegrationRuntimeStatus.ENABLED) this.assertCanEnable(integration)
            integration.runtimeStatus = dto.runtimeStatus
            integration.enabled = dto.runtimeStatus === IntegrationRuntimeStatus.ENABLED
            integration.enabledAt = integration.enabled ? integration.enabledAt || new Date() : null
        }

        integration.configured = this.isConfigured(integration)
        integration.healthy = false
        integration.lastHealthCheckAt = null
        integration.lastError = null

        await this.settingsRepo.save(integration)
        return this.toSafeDto(integration)
    }

    async test(providerKey: IntegrationProviderKey) {
        await this.ensureDefaults()
        const integration = await this.settingsRepo.findOneBy({providerKey})
        if (!integration) throw new NotFoundException("Integration not found")

        integration.configured = this.isConfigured(integration)
        integration.healthy = integration.configured && this.hasBillingAccess(integration)
        integration.lastHealthCheckAt = new Date()
        integration.lastError = integration.healthy ? null : "Integration is not paid or not configured"
        await this.settingsRepo.save(integration)

        return this.toSafeDto(integration)
    }

    async enqueue(providerKey: IntegrationProviderKey, eventName: string, payload: Record<string, unknown>) {
        try {
            const integration = await this.settingsRepo.findOneBy({providerKey})
            if (!integration || !this.canDeliver(integration, eventName)) return null

            const eventId = String(payload.eventId || `${eventName}-${Date.now()}-${Math.random().toString(16).slice(2)}`)
            return await this.outboxRepo.save(
                this.outboxRepo.create({
                    providerKey,
                    eventName,
                    eventId,
                    idempotencyKey: String(payload.idempotencyKey || eventId),
                    payload,
                    status: IntegrationOutboxStatus.PENDING
                })
            )
        } catch (error) {
            this.logger.warn(`Failed to enqueue ${providerKey}:${eventName}: ${(error as Error).message}`)
            return null
        }
    }

    private async ensureDefaults() {
        const datra = await this.settingsRepo.findOneBy({providerKey: IntegrationProviderKey.DATRA_CDP})
        if (!datra) {
            await this.settingsRepo.save(
                this.settingsRepo.create({
                    providerKey: IntegrationProviderKey.DATRA_CDP,
                    title: "Datra CDP",
                    description: "Платная интеграция с Datra для CDP, заказов, клиентов и событий.",
                    isPaid: true,
                    billingStatus: IntegrationBillingStatus.LOCKED,
                    runtimeStatus: IntegrationRuntimeStatus.DISABLED,
                    enabled: false,
                    configured: false,
                    healthy: false,
                    enabledScopes: [...DEFAULT_SCOPES]
                })
            )
        }
    }

    private assertCanEnable(integration: IntegrationSettingEntity) {
        if (!this.hasBillingAccess(integration)) throw new BadRequestException("Integration is locked by billing")
        if (!this.isConfigured(integration)) throw new BadRequestException("Integration is not configured")
    }

    private hasBillingAccess(integration: IntegrationSettingEntity) {
        if (!integration.isPaid) return true
        if (integration.billingStatus !== IntegrationBillingStatus.ACTIVE) return false
        if (!integration.billingActiveUntil) return true
        return integration.billingActiveUntil.getTime() > Date.now()
    }

    private isConfigured(integration: IntegrationSettingEntity) {
        if (integration.providerKey === IntegrationProviderKey.DATRA_CDP) {
            const secrets = this.secretService.decryptJson(integration.secretConfigEncrypted)
            const publicConfig = integration.publicConfig || {}
            return Boolean(secrets?.apiToken && (publicConfig.endpointUrl || publicConfig.apiUrl || publicConfig.url))
        }
        return true
    }

    private canDeliver(integration: IntegrationSettingEntity, eventName: string) {
        if (!integration.enabled || integration.runtimeStatus !== IntegrationRuntimeStatus.ENABLED) return false
        if (!this.hasBillingAccess(integration) || !this.isConfigured(integration)) return false
        const scopes = integration.enabledScopes || []
        if (eventName.startsWith("order_status")) return scopes.includes("order_statuses")
        if (eventName.startsWith("order")) return scopes.includes("orders")
        if (eventName.startsWith("customer")) return scopes.includes("customers")
        if (eventName.startsWith("product")) return scopes.includes("products")
        if (eventName.startsWith("category")) return scopes.includes("categories")
        if (eventName.startsWith("branch")) return scopes.includes("branches")
        return scopes.includes("events")
    }

    private toSafeDto(integration: IntegrationSettingEntity) {
        const hasSecret = Boolean(integration.secretConfigEncrypted)
        return {
            ...integration,
            secretConfigEncrypted: undefined,
            hasSecret,
            status: this.buildStatus(integration)
        }
    }

    private buildStatus(integration: IntegrationSettingEntity) {
        if (!this.hasBillingAccess(integration)) return "billing_locked"
        if (!integration.configured) return "not_configured"
        if (integration.runtimeStatus === IntegrationRuntimeStatus.PAUSED) return "paused"
        if (integration.enabled) return integration.healthy ? "healthy" : "enabled"
        return "available"
    }
}

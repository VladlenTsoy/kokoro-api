import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm"

export enum IntegrationProviderKey {
    DATRA_CDP = "datra_cdp",
    META = "meta"
}

export enum IntegrationBillingStatus {
    FREE = "free",
    ACTIVE = "active",
    LOCKED = "locked",
    EXPIRED = "expired"
}

export enum IntegrationRuntimeStatus {
    DISABLED = "disabled",
    ENABLED = "enabled",
    PAUSED = "paused",
    ERROR = "error"
}

export type IntegrationEventScope =
    | "customers"
    | "devices"
    | "products"
    | "categories"
    | "branches"
    | "orders"
    | "order_statuses"
    | "events"
    | "promotions"
    | "loyalty"

@Entity("integration_settings")
export class IntegrationSettingEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({type: "varchar", length: 64, unique: true})
    providerKey: IntegrationProviderKey

    @Column({type: "varchar", length: 120})
    title: string

    @Column({type: "varchar", length: 255, nullable: true})
    description?: string | null

    @Column({type: "boolean", default: true})
    isPaid: boolean

    @Column({type: "enum", enum: IntegrationBillingStatus, default: IntegrationBillingStatus.LOCKED})
    billingStatus: IntegrationBillingStatus

    @Column({type: "enum", enum: IntegrationRuntimeStatus, default: IntegrationRuntimeStatus.DISABLED})
    runtimeStatus: IntegrationRuntimeStatus

    @Column({type: "boolean", default: false})
    enabled: boolean

    @Column({type: "boolean", default: false})
    configured: boolean

    @Column({type: "boolean", default: false})
    healthy: boolean

    @Column({type: "json", nullable: true})
    enabledScopes?: IntegrationEventScope[] | null

    @Column({type: "json", nullable: true})
    publicConfig?: Record<string, unknown> | null

    @Column({type: "text", nullable: true})
    secretConfigEncrypted?: string | null

    @Column({type: "varchar", length: 255, nullable: true})
    lastError?: string | null

    @Column({type: "datetime", nullable: true})
    lastHealthCheckAt?: Date | null

    @Column({type: "datetime", nullable: true})
    enabledAt?: Date | null

    @Column({type: "datetime", nullable: true})
    billingActiveUntil?: Date | null

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}

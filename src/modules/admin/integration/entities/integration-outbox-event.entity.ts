import {Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm"
import {IntegrationProviderKey} from "./integration-setting.entity"

export enum IntegrationOutboxStatus {
    PENDING = "pending",
    SENT = "sent",
    SKIPPED = "skipped",
    FAILED = "failed",
    DEAD = "dead"
}

@Entity("integration_outbox_events")
export class IntegrationOutboxEventEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Index()
    @Column({type: "varchar", length: 64})
    providerKey: IntegrationProviderKey

    @Index()
    @Column({type: "varchar", length: 80})
    eventName: string

    @Column({type: "varchar", length: 120})
    eventId: string

    @Column({type: "varchar", length: 160})
    idempotencyKey: string

    @Column({type: "json"})
    payload: Record<string, unknown>

    @Column({type: "enum", enum: IntegrationOutboxStatus, default: IntegrationOutboxStatus.PENDING})
    status: IntegrationOutboxStatus

    @Column({type: "int", default: 0})
    attempts: number

    @Column({type: "text", nullable: true})
    lastError?: string | null

    @Column({type: "datetime", nullable: true})
    nextAttemptAt?: Date | null

    @Column({type: "datetime", nullable: true})
    sentAt?: Date | null

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}

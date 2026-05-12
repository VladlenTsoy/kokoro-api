import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm"
import {OrderEntity} from "../../order/entities/order.entity"

export enum PosReceiptStatus {
    DRAFT = "draft",
    PRINTED = "printed",
    SENT = "sent",
    FISCALIZED = "fiscalized",
    FAILED = "failed"
}

@Entity("pos_receipts")
export class PosReceiptEntity {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => OrderEntity, {nullable: false, onDelete: "CASCADE"})
    order: OrderEntity

    @Column({type: "varchar", length: 64, unique: true})
    receiptNumber: string

    @Column({type: "enum", enum: PosReceiptStatus, default: PosReceiptStatus.DRAFT})
    status: PosReceiptStatus

    @Column({type: "varchar", length: 120, nullable: true})
    fiscalProviderRef?: string | null

    @Column({type: "json", nullable: true})
    payload?: Record<string, unknown> | null

    @Column({type: "datetime", nullable: true})
    printedAt?: Date | null

    @Column({type: "datetime", nullable: true})
    sentAt?: Date | null

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}

import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm"
import {OrderEntity} from "../../order/entities/order.entity"
import {PaymentMethodEntity} from "../../payment-method/entities/payment-method.entity"
import {PosShiftEntity} from "./pos-shift.entity"

export enum PosPaymentStatus {
    PENDING = "pending",
    PAID = "paid",
    FAILED = "failed",
    REFUNDED = "refunded",
    VOIDED = "voided"
}

@Entity("pos_payments")
export class PosPaymentEntity {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => OrderEntity, {nullable: false, onDelete: "CASCADE"})
    order: OrderEntity

    @ManyToOne(() => PosShiftEntity, {nullable: false, onDelete: "RESTRICT"})
    shift: PosShiftEntity

    @ManyToOne(() => PaymentMethodEntity, {nullable: false, onDelete: "RESTRICT"})
    method: PaymentMethodEntity

    @Column({type: "int"})
    amount: number

    @Column({type: "enum", enum: PosPaymentStatus, default: PosPaymentStatus.PENDING})
    status: PosPaymentStatus

    @Column({type: "varchar", length: 120, nullable: true})
    idempotencyKey?: string | null

    @Column({type: "varchar", length: 120, nullable: true})
    providerRef?: string | null

    @Column({type: "datetime", nullable: true})
    paidAt?: Date | null

    @Column({type: "datetime", nullable: true})
    refundedAt?: Date | null

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}

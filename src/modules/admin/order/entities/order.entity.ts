import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, UpdateDateColumn} from "typeorm"
import {OrderStatusEntity} from "../../order-status/entities/order-status.entity"
import {PaymentMethodEntity} from "../../payment-method/entities/payment-method.entity"
import {SourceEntity} from "../../source/entities/source.entity"
import {DeliveryTypeEntity} from "../../delivery-type/entities/delivery-type.entity"
import {ClientEntity} from "../../client/entities/client.entity"
import {ClientAddressEntity} from "../../client-address/entities/client-address.entity"
import {OrderItemEntity} from "../../order-item/entities/order-item.entity"
import {EmployeeEntity} from "../../employee/entities/employee.entity"
import {OrderStatusHistoryEntity} from "../../order-status-history/entities/order-status-history.entity"
import {OrderCommentEntity} from "./order-comment.entity"
import {SalesPointEntity} from "../../sales-point/entities/sales-point.entity"
import {PosDeviceEntity} from "../../pos/entities/pos-device.entity"
import {PosShiftEntity} from "../../pos/entities/pos-shift.entity"

export enum OrderPaymentStatus {
    PENDING = "pending",
    PAID = "paid",
    FAILED = "failed",
    REFUNDED = "refunded"
}

export enum OrderDeliveryStatus {
    PENDING = "pending",
    PREPARING = "preparing",
    READY = "ready",
    DELIVERING = "delivering",
    DELIVERED = "delivered",
    CANCELLED = "cancelled"
}

@Entity("orders")
export class OrderEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({type: "varchar", length: 32, unique: true, nullable: true})
    orderNumber?: string | null

    @ManyToOne(() => OrderStatusEntity, {nullable: false})
    status: OrderStatusEntity

    @ManyToOne(() => PaymentMethodEntity, {nullable: true})
    paymentMethod?: PaymentMethodEntity

    @ManyToOne(() => SourceEntity, {nullable: true})
    source?: SourceEntity

    @ManyToOne(() => DeliveryTypeEntity, {nullable: true})
    deliveryType?: DeliveryTypeEntity

    @ManyToOne(() => ClientEntity, (client) => client.orders, {nullable: true, onDelete: "SET NULL"})
    client?: ClientEntity

    @ManyToOne(() => ClientAddressEntity, (address) => address.orders, {nullable: true, onDelete: "SET NULL"})
    clientAddress?: ClientAddressEntity

    @ManyToOne(() => EmployeeEntity, {nullable: true, onDelete: "SET NULL"})
    assignedEmployee?: EmployeeEntity | null

    @Column({type: "varchar", length: 32, default: "admin"})
    orderSource: string

    @ManyToOne(() => SalesPointEntity, {nullable: true, onDelete: "SET NULL"})
    salesPoint?: SalesPointEntity | null

    @ManyToOne(() => PosShiftEntity, {nullable: true, onDelete: "SET NULL"})
    posShift?: PosShiftEntity | null

    @ManyToOne(() => PosDeviceEntity, {nullable: true, onDelete: "SET NULL"})
    posDevice?: PosDeviceEntity | null

    @Column({type: "enum", enum: OrderPaymentStatus, default: OrderPaymentStatus.PENDING})
    paymentStatus: OrderPaymentStatus

    @Column({type: "enum", enum: OrderDeliveryStatus, default: OrderDeliveryStatus.PENDING})
    deliveryStatus: OrderDeliveryStatus

    @Column({type: "int", default: 0})
    subtotal: number

    @Column({type: "int", default: 0})
    discountTotal: number

    @Column({type: "int", default: 0})
    deliveryPrice: number

    @Column({type: "varchar", length: 64, nullable: true})
    promoCode?: string | null

    @Column({type: "int", default: 0})
    promoDiscount: number

    @Column({type: "int", default: 0})
    bonusSpent: number

    @Column({type: "int", default: 0})
    bonusEarned: number

    @Column({type: "int", default: 0})
    total: number

    @Column({type: "varchar", length: 50, nullable: true})
    phone?: string

    @Column({type: "varchar", length: 255, nullable: true})
    clientName?: string

    @Column({type: "varchar", length: 255, nullable: true})
    comment?: string

    @Column({type: "varchar", length: 255, nullable: true})
    cancelReason?: string | null

    @Column({type: "varchar", length: 96, unique: true, nullable: true})
    accessToken?: string | null

    @Column({type: "datetime", nullable: true})
    confirmedAt?: Date | null

    @Column({type: "datetime", nullable: true})
    completedAt?: Date | null

    @Column({type: "datetime", nullable: true})
    cancelledAt?: Date | null

    @Column({type: "datetime", nullable: true})
    bonusesCreditedAt?: Date | null

    @OneToMany(() => OrderItemEntity, (item) => item.order)
    items: OrderItemEntity[]

    @OneToMany(() => OrderStatusHistoryEntity, (history) => history.order)
    histories: OrderStatusHistoryEntity[]

    @OneToMany(() => OrderCommentEntity, (comment) => comment.order)
    comments: OrderCommentEntity[]

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}

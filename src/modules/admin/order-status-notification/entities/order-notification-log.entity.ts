import {Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm"
import {OrderEntity} from "../../order/entities/order.entity"
import {OrderStatusEntity} from "../../order-status/entities/order-status.entity"
import {NotificationTarget, NotificationType} from "./order-status-notification.entity"

export enum OrderNotificationLogStatus {
    QUEUED = "queued",
    SENT = "sent",
    FAILED = "failed",
    SKIPPED = "skipped"
}

@Entity("order_notification_logs")
export class OrderNotificationLogEntity {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => OrderEntity, {onDelete: "CASCADE"})
    @JoinColumn({name: "orderId"})
    order: OrderEntity

    @ManyToOne(() => OrderStatusEntity, {onDelete: "CASCADE"})
    @JoinColumn({name: "statusId"})
    status: OrderStatusEntity

    @Column({type: "enum", enum: NotificationType})
    type: NotificationType

    @Column({type: "enum", enum: NotificationTarget})
    sendTo: NotificationTarget

    @Column({type: "varchar", length: 255, nullable: true})
    recipient?: string | null

    @Column({type: "text"})
    message: string

    @Column({type: "enum", enum: OrderNotificationLogStatus, default: OrderNotificationLogStatus.QUEUED})
    statusValue: OrderNotificationLogStatus

    @Column({type: "text", nullable: true})
    error?: string | null

    @Column({type: "datetime", nullable: true})
    sentAt?: Date | null

    @CreateDateColumn()
    createdAt: Date
}

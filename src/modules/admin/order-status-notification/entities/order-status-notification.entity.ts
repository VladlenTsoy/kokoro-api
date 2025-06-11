import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn} from "typeorm"
import {OrderStatusEntity} from "../../order-status/entities/order-status.entity"

export enum NotificationType {
    SMS = "sms",
    EMAIL = "email",
    PUSH = "push",
    TELEGRAM = "telegram",
    WEBHOOK = "webhook"
}

export enum NotificationTarget {
    CLIENT = "client",
    MANAGER = "manager",
    COURIER = "courier",
    ADMIN = "admin"
}

@Entity("order_status_notifications")
export class OrderStatusNotificationEntity {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => OrderStatusEntity, {onDelete: "CASCADE"})
    status: OrderStatusEntity

    @Column({type: "enum", enum: NotificationType})
    type: NotificationType

    @Column({type: "enum", enum: NotificationTarget})
    sendTo: NotificationTarget

    @Column({type: "varchar", length: 255})
    template: string

    @Column({type: "boolean", default: true})
    isActive: boolean

    @CreateDateColumn()
    createdAt: Date
}

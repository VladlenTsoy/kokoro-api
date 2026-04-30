import {Injectable} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {OrderStatusNotificationEntity} from "./entities/order-status-notification.entity"
import {CreateOrderStatusNotificationDto} from "./dto/create-order-status-notification.dto"
import {UpdateOrderStatusNotificationDto} from "./dto/update-order-status-notification.dto"
import {OrderStatusEntity} from "../order-status/entities/order-status.entity"
import {OrderNotificationLogEntity, OrderNotificationLogStatus} from "./entities/order-notification-log.entity"
import {OrderEntity} from "../order/entities/order.entity"
import {NotificationTarget, NotificationType} from "./entities/order-status-notification.entity"

@Injectable()
export class OrderStatusNotificationService {
    constructor(
        @InjectRepository(OrderStatusNotificationEntity)
        private readonly repo: Repository<OrderStatusNotificationEntity>,
        @InjectRepository(OrderStatusEntity)
        private readonly statusRepo: Repository<OrderStatusEntity>,
        @InjectRepository(OrderNotificationLogEntity)
        private readonly logRepo: Repository<OrderNotificationLogEntity>
    ) {}

    async create(dto: CreateOrderStatusNotificationDto) {
        const status = await this.statusRepo.findOneBy({id: dto.statusId})

        const entity = this.repo.create({
            ...dto,
            status
        })

        return this.repo.save(entity)
    }

    findAll() {
        return this.repo.find({relations: ["status"]})
    }

    findOne(id: number) {
        return this.repo.findOne({where: {id}, relations: ["status"]})
    }

    async update(id: number, dto: UpdateOrderStatusNotificationDto) {
        const updateData: any = {...dto}

        if (dto.statusId) {
            const status = await this.statusRepo.findOneBy({id: dto.statusId})
            updateData.status = status
        }

        await this.repo.update(id, updateData)
        return this.findOne(id)
    }

    remove(id: number) {
        return this.repo.delete(id)
    }

    findLogs(orderId?: number) {
        return this.logRepo.find({
            where: orderId ? {order: {id: orderId}} : {},
            relations: {order: true, status: true},
            order: {id: "DESC"}
        })
    }

    private renderTemplate(template: string, order: OrderEntity, status: OrderStatusEntity) {
        return template
            .replace(/\{\{orderNumber\}\}/g, order.orderNumber || String(order.id))
            .replace(/\{\{orderId\}\}/g, String(order.id))
            .replace(/\{\{status\}\}/g, status.title)
            .replace(/\{\{total\}\}/g, String(order.total))
            .replace(/\{\{clientName\}\}/g, order.client?.name || order.clientName || "")
    }

    private resolveRecipient(notification: OrderStatusNotificationEntity, order: OrderEntity) {
        if (notification.sendTo === NotificationTarget.CLIENT) return order.client?.phone || order.phone || null
        return null
    }

    async enqueueForOrderStatus(order: OrderEntity, status: OrderStatusEntity) {
        const notifications = await this.repo.find({
            where: {status: {id: status.id}, isActive: true},
            relations: {status: true}
        })

        const logs: OrderNotificationLogEntity[] = []
        for (const notification of notifications) {
            const recipient = this.resolveRecipient(notification, order)
            const message = this.renderTemplate(notification.template, order, status)
            let statusValue = recipient ? OrderNotificationLogStatus.QUEUED : OrderNotificationLogStatus.SKIPPED
            let error: string | null = recipient ? null : "Recipient is missing"
            let sentAt: Date | null = null

            if (notification.type === NotificationType.WEBHOOK && recipient) {
                try {
                    await fetch(notification.template, {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({
                            orderId: order.id,
                            orderNumber: order.orderNumber,
                            status: status.title,
                            recipient
                        })
                    })
                    statusValue = OrderNotificationLogStatus.SENT
                    sentAt = new Date()
                } catch (err: any) {
                    statusValue = OrderNotificationLogStatus.FAILED
                    error = err?.message || "Webhook request failed"
                }
            }

            logs.push(
                this.logRepo.create({
                    order,
                    status,
                    type: notification.type,
                    sendTo: notification.sendTo,
                    recipient,
                    message,
                    statusValue,
                    error,
                    sentAt
                })
            )
        }

        return this.logRepo.save(logs)
    }
}

import {BadRequestException, Injectable, NotFoundException} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Between, Repository} from "typeorm"
import {OrderDeliveryStatus, OrderEntity, OrderPaymentStatus} from "./entities/order.entity"
import {CreateOrderDto} from "./dto/create-order.dto"
import {UpdateOrderDto} from "./dto/update-order.dto"
import {OrderStatusEntity} from "../order-status/entities/order-status.entity"
import {PaymentMethodEntity} from "../payment-method/entities/payment-method.entity"
import {SourceEntity} from "../source/entities/source.entity"
import {DeliveryTypeEntity} from "../delivery-type/entities/delivery-type.entity"
import {EmployeeEntity} from "../employee/entities/employee.entity"
import {OrderStatusHistoryEntity} from "../order-status-history/entities/order-status-history.entity"
import {OrderCommentEntity} from "./entities/order-comment.entity"
import {FilterAdminOrdersDto} from "./dto/filter-admin-orders.dto"
import {UpdateOrderStatusDto} from "./dto/update-order-status.dto"
import {AdminAuthenticatedUser} from "../auth/types/admin-authenticated-user.type"
import {CreateOrderCommentDto} from "./dto/create-order-comment.dto"
import {CancelOrderDto} from "./dto/cancel-order.dto"
import {OrderStatusTransitionEntity} from "../order-status/entities/order-status-transition.entity"
import {ProductVariantSizeEntity} from "../product-variant-size/entities/product-variant-size.entity"
import {ProductVariantEntity} from "../product-variant/entities/product-variant.entity"
import {OrderStatusNotificationService} from "../order-status-notification/order-status-notification.service"
import {ClientEntity} from "../client/entities/client.entity"
import {
    ClientBonusTransactionEntity,
    ClientBonusTransactionType
} from "../client/entities/client-bonus-transaction.entity"
import {IntegrationService} from "../integration/integration.service"
import {IntegrationProviderKey} from "../integration/entities/integration-setting.entity"

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(OrderEntity)
        private readonly repo: Repository<OrderEntity>,
        @InjectRepository(OrderStatusEntity)
        private readonly statusRepo: Repository<OrderStatusEntity>,
        @InjectRepository(PaymentMethodEntity)
        private readonly paymentRepo: Repository<PaymentMethodEntity>,
        @InjectRepository(SourceEntity)
        private readonly sourceRepo: Repository<SourceEntity>,
        @InjectRepository(DeliveryTypeEntity)
        private readonly deliveryRepo: Repository<DeliveryTypeEntity>,
        @InjectRepository(EmployeeEntity)
        private readonly employeeRepo: Repository<EmployeeEntity>,
        @InjectRepository(OrderStatusHistoryEntity)
        private readonly historyRepo: Repository<OrderStatusHistoryEntity>,
        @InjectRepository(OrderCommentEntity)
        private readonly commentRepo: Repository<OrderCommentEntity>,
        @InjectRepository(OrderStatusTransitionEntity)
        private readonly transitionRepo: Repository<OrderStatusTransitionEntity>,
        @InjectRepository(ProductVariantSizeEntity)
        private readonly productVariantSizeRepo: Repository<ProductVariantSizeEntity>,
        @InjectRepository(ProductVariantEntity)
        private readonly productVariantRepo: Repository<ProductVariantEntity>,
        @InjectRepository(ClientEntity)
        private readonly clientRepo: Repository<ClientEntity>,
        @InjectRepository(ClientBonusTransactionEntity)
        private readonly bonusTransactionRepo: Repository<ClientBonusTransactionEntity>,
        private readonly notificationService: OrderStatusNotificationService,
        private readonly integrationService: IntegrationService
    ) {}

    private readonly orderRelations = {
        status: true,
        paymentMethod: true,
        source: true,
        deliveryType: true,
        assignedEmployee: true,
        client: true,
        clientAddress: true,
        items: {
            productVariant: {
                color: true,
                product: true,
                images: true
            },
            size: {
                size: true
            }
        },
        histories: {
            fromStatus: true,
            toStatus: true,
            employee: true
        },
        comments: {
            employee: true
        }
    }

    private buildOrderNumber(orderId: number) {
        return `KO-${String(orderId).padStart(6, "0")}`
    }

    private buildOrderIntegrationPayload(order: OrderEntity, eventName: string) {
        return {
            eventId: `${eventName}-${order.id}-${Date.now()}`,
            idempotencyKey: `${eventName}-${order.id}-${order.updatedAt?.getTime?.() || Date.now()}`,
            orderId: order.id,
            externalId: `kokoro-order-${order.id}`,
            orderNumber: order.orderNumber,
            customerExternalId: order.client?.id ? `kokoro-client-${order.client.id}` : undefined,
            phone: order.phone || order.client?.phone,
            clientName: order.clientName || order.client?.name,
            status: order.deliveryStatus,
            paymentStatus: order.paymentStatus,
            total: order.total,
            subtotal: order.subtotal,
            discountTotal: order.discountTotal,
            deliveryPrice: order.deliveryPrice,
            promoCode: order.promoCode,
            sourcePlatform: order.source?.title || "admin",
            createdAt: order.createdAt,
            completedAt: order.completedAt,
            cancelledAt: order.cancelledAt
        }
    }

    private async enqueueDatraOrderEvent(order: OrderEntity, eventName: string) {
        await this.integrationService.enqueue(
            IntegrationProviderKey.DATRA_CDP,
            eventName,
            this.buildOrderIntegrationPayload(order, eventName)
        )
    }

    private normalizePagination(page?: number, pageSize?: number) {
        const safePage = Number(page) > 0 ? Number(page) : 1
        const safePageSize = Number(pageSize) > 0 ? Math.min(Number(pageSize), 100) : 20
        return {page: safePage, pageSize: safePageSize, skip: (safePage - 1) * safePageSize}
    }

    private parseDateFilter(value: string, boundary: "start" | "end") {
        const date = new Date(value)
        if (Number.isNaN(date.getTime())) {
            throw new BadRequestException("Invalid date filter")
        }

        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            date.setHours(
                boundary === "start" ? 0 : 23,
                boundary === "start" ? 0 : 59,
                boundary === "start" ? 0 : 59,
                boundary === "start" ? 0 : 999
            )
        }

        return date
    }

    private problemThresholdDate() {
        return new Date(Date.now() - 10 * 60 * 1000)
    }

    private getSlaThresholdMinutes(deliveryStatus?: OrderDeliveryStatus | null) {
        if (deliveryStatus === OrderDeliveryStatus.PENDING) return 15
        if (deliveryStatus === OrderDeliveryStatus.PREPARING) return 30
        if (deliveryStatus === OrderDeliveryStatus.READY || deliveryStatus === OrderDeliveryStatus.DELIVERING) return 60
        return null
    }

    private getOrderSlaSnapshot(order: OrderEntity, lastStatusChangedAt?: Date | string | null) {
        const thresholdMinutes = this.getSlaThresholdMinutes(order.deliveryStatus)
        const statusChangedAt = lastStatusChangedAt ? new Date(lastStatusChangedAt) : order.createdAt
        const ageMinutes = Math.max(Math.floor((Date.now() - statusChangedAt.getTime()) / 60000), 0)

        if (!thresholdMinutes) {
            return {
                lastStatusChangedAt: statusChangedAt,
                ageMinutes,
                thresholdMinutes: null,
                state: null
            }
        }

        let state: "new" | "waiting" | "stuck" = "new"
        if (ageMinutes >= thresholdMinutes * 2) state = "stuck"
        else if (ageMinutes >= thresholdMinutes) state = "waiting"

        return {
            lastStatusChangedAt: statusChangedAt,
            ageMinutes,
            thresholdMinutes,
            state
        }
    }

    private lastStatusChangedAtSql() {
        return `(SELECT MAX(history.changedAt) FROM order_status_histories history WHERE history.orderId = order.id)`
    }

    private applyAttentionOrdersCondition(query: ReturnType<Repository<OrderEntity>["createQueryBuilder"]>) {
        const lastStatusChangedAt = `COALESCE(${this.lastStatusChangedAtSql()}, order.createdAt)`
        query.andWhere(
            `(
                (order.deliveryStatus = :pending AND ${lastStatusChangedAt} <= :pendingThreshold)
                OR (order.deliveryStatus = :preparing AND ${lastStatusChangedAt} <= :preparingThreshold)
                OR (order.deliveryStatus IN (:...readyStatuses) AND ${lastStatusChangedAt} <= :readyThreshold)
            )`,
            {
                pending: OrderDeliveryStatus.PENDING,
                preparing: OrderDeliveryStatus.PREPARING,
                readyStatuses: [OrderDeliveryStatus.READY, OrderDeliveryStatus.DELIVERING],
                pendingThreshold: new Date(Date.now() - 15 * 60 * 1000),
                preparingThreshold: new Date(Date.now() - 30 * 60 * 1000),
                readyThreshold: new Date(Date.now() - 60 * 60 * 1000)
            }
        )
    }

    private applyProblemOrdersCondition(query: ReturnType<Repository<OrderEntity>["createQueryBuilder"]>) {
        query.andWhere(
            `(
                (order.deliveryStatus = :pending AND order.createdAt <= :problemThreshold)
                OR (order.paymentStatus = :paid AND order.deliveryStatus IN (:...problemDeliveryStatuses))
                OR order.paymentStatus = :failed
            )`,
            {
                pending: OrderDeliveryStatus.PENDING,
                paid: OrderPaymentStatus.PAID,
                failed: OrderPaymentStatus.FAILED,
                problemThreshold: this.problemThresholdDate(),
                problemDeliveryStatuses: [OrderDeliveryStatus.PENDING, OrderDeliveryStatus.CANCELLED]
            }
        )
    }

    private async getOrderOrFail(id: number) {
        const order = await this.repo.findOne({
            where: {id},
            relations: this.orderRelations
        })

        if (!order) {
            throw new NotFoundException("Order not found")
        }

        return order
    }

    private async assertTransitionAllowed(fromStatusId: number, toStatusId: number) {
        if (fromStatusId === toStatusId) return

        const configuredTransitionsCount = await this.transitionRepo.count({
            where: {fromStatus: {id: fromStatusId}, isActive: true}
        })
        if (!configuredTransitionsCount) return

        const transition = await this.transitionRepo.findOne({
            where: {
                fromStatus: {id: fromStatusId},
                toStatus: {id: toStatusId},
                isActive: true
            }
        })
        if (!transition) {
            throw new BadRequestException("Order status transition is not allowed")
        }
    }

    private async applyInventoryTransition(
        order: OrderEntity,
        previous: OrderDeliveryStatus,
        next: OrderDeliveryStatus
    ) {
        if (previous === next) return
        if (![OrderDeliveryStatus.CANCELLED, OrderDeliveryStatus.DELIVERED].includes(next)) return
        if ([OrderDeliveryStatus.CANCELLED, OrderDeliveryStatus.DELIVERED].includes(previous)) return

        const fullOrder = await this.repo.findOne({
            where: {id: order.id},
            relations: {
                items: {
                    productVariant: true,
                    size: true
                }
            }
        })

        for (const item of fullOrder?.items || []) {
            if (item.size) {
                const variantSize = await this.productVariantSizeRepo.findOneBy({id: item.size.id})
                if (!variantSize) continue

                variantSize.reservedQty = Math.max(Number(variantSize.reservedQty || 0) - item.qty, 0)
                if (next === OrderDeliveryStatus.DELIVERED) {
                    variantSize.qty = Math.max(Number(variantSize.qty || 0) - item.qty, 0)
                    variantSize.soldQty = Number(variantSize.soldQty || 0) + item.qty
                }
                await this.productVariantSizeRepo.save(variantSize)
                continue
            }

            if (!item.productVariant) continue
            const variant = await this.productVariantRepo.findOneBy({id: item.productVariant.id})
            if (!variant || variant.qty === null || variant.qty === undefined) continue

            variant.reservedQty = Math.max(Number(variant.reservedQty || 0) - item.qty, 0)
            if (next === OrderDeliveryStatus.DELIVERED) {
                variant.qty = Math.max(Number(variant.qty || 0) - item.qty, 0)
                variant.soldQty = Number(variant.soldQty || 0) + item.qty
            }
            await this.productVariantRepo.save(variant)
        }
    }

    private async applyBonusTransition(order: OrderEntity, previous: OrderDeliveryStatus, next: OrderDeliveryStatus) {
        if (previous === next || !order.client) return
        if (next === OrderDeliveryStatus.DELIVERED && !order.bonusesCreditedAt && order.bonusEarned > 0) {
            const client = await this.clientRepo.findOneBy({id: order.client.id})
            if (!client) return

            client.bonusBalance = Number(client.bonusBalance || 0) + order.bonusEarned
            await this.clientRepo.save(client)
            order.bonusesCreditedAt = new Date()
            await this.repo.save(order)
            await this.bonusTransactionRepo.save(
                this.bonusTransactionRepo.create({
                    client,
                    order,
                    type: ClientBonusTransactionType.EARN,
                    amount: order.bonusEarned,
                    comment: "Bonuses earned from completed order"
                })
            )
        }

        if (
            next === OrderDeliveryStatus.CANCELLED &&
            ![OrderDeliveryStatus.CANCELLED, OrderDeliveryStatus.DELIVERED].includes(previous) &&
            order.bonusSpent > 0
        ) {
            const client = await this.clientRepo.findOneBy({id: order.client.id})
            if (!client) return

            client.bonusBalance = Number(client.bonusBalance || 0) + order.bonusSpent
            await this.clientRepo.save(client)
            await this.bonusTransactionRepo.save(
                this.bonusTransactionRepo.create({
                    client,
                    order,
                    type: ClientBonusTransactionType.REFUND,
                    amount: order.bonusSpent,
                    comment: "Bonuses refunded after order cancellation"
                })
            )
        }
    }

    private mapStatusToDeliveryStatus(status: OrderStatusEntity) {
        if (status.deliveryStatus && Object.values(OrderDeliveryStatus).includes(status.deliveryStatus as OrderDeliveryStatus)) {
            return status.deliveryStatus as OrderDeliveryStatus
        }

        const code = status.code?.trim().toLowerCase()
        if (code && Object.values(OrderDeliveryStatus).includes(code as OrderDeliveryStatus)) {
            return code as OrderDeliveryStatus
        }

        const statusKey = `${code || ""} ${status.title}`.toLowerCase()
        if (statusKey.includes("cancel") || statusKey.includes("отмен")) return OrderDeliveryStatus.CANCELLED
        if (
            statusKey.includes("complete") ||
            statusKey.includes("done") ||
            statusKey.includes("closed") ||
            statusKey.includes("заверш") ||
            statusKey.includes("выдан")
        ) {
            return OrderDeliveryStatus.DELIVERED
        }
        if (statusKey.includes("deliver") || statusKey.includes("courier") || statusKey.includes("достав")) {
            return OrderDeliveryStatus.DELIVERING
        }
        if (statusKey.includes("ready") || statusKey.includes("готов")) return OrderDeliveryStatus.READY
        if (
            statusKey.includes("confirm") ||
            statusKey.includes("accept") ||
            statusKey.includes("prepar") ||
            statusKey.includes("подтверж") ||
            statusKey.includes("принят") ||
            statusKey.includes("готовит")
        ) {
            return OrderDeliveryStatus.PREPARING
        }
        return OrderDeliveryStatus.PENDING
    }

    async create(dto: CreateOrderDto) {
        const status = await this.statusRepo.findOneBy({id: dto.statusId})
        if (!status) throw new BadRequestException("Order status not found")

        const paymentMethod = dto.paymentMethodId ? await this.paymentRepo.findOneBy({id: dto.paymentMethodId}) : null
        const source = dto.sourceId ? await this.sourceRepo.findOneBy({id: dto.sourceId}) : null
        const deliveryType = dto.deliveryTypeId ? await this.deliveryRepo.findOneBy({id: dto.deliveryTypeId}) : null
        const assignedEmployee = dto.assignedEmployeeId
            ? await this.employeeRepo.findOneBy({id: dto.assignedEmployeeId})
            : null
        const deliveryPrice = dto.deliveryPrice || 0

        let entity = this.repo.create({
            ...dto,
            status,
            paymentMethod,
            source,
            deliveryType,
            assignedEmployee,
            subtotal: dto.total,
            deliveryPrice,
            total: dto.total + deliveryPrice,
            orderSource: "admin",
            paymentStatus: OrderPaymentStatus.PENDING,
            deliveryStatus: this.mapStatusToDeliveryStatus(status)
        })

        entity = await this.repo.save(entity)
        entity.orderNumber = this.buildOrderNumber(entity.id)
        await this.repo.save(entity)

        await this.historyRepo.save(
            this.historyRepo.create({
                order: entity,
                fromStatus: null,
                toStatus: status,
                changedBy: "system",
                comment: "Order created",
                visibleForClient: true
            })
        )

        const createdOrder = await this.findOne(entity.id)
        await this.enqueueDatraOrderEvent(createdOrder, "order_created")
        return createdOrder
    }

    findAll() {
        return this.repo.find({relations: this.orderRelations})
    }

    findOne(id: number) {
        return this.getOrderOrFail(id)
    }

    async update(id: number, dto: UpdateOrderDto) {
        const order = await this.getOrderOrFail(id)

        if (dto.statusId && dto.statusId !== order.status.id) {
            return this.updateStatus(id, {statusId: dto.statusId}, null)
        }

        if (dto.paymentMethodId !== undefined) {
            order.paymentMethod = dto.paymentMethodId
                ? await this.paymentRepo.findOneBy({id: dto.paymentMethodId})
                : null
        }
        if (dto.sourceId !== undefined) {
            order.source = dto.sourceId ? await this.sourceRepo.findOneBy({id: dto.sourceId}) : null
        }
        if (dto.deliveryTypeId !== undefined) {
            order.deliveryType = dto.deliveryTypeId ? await this.deliveryRepo.findOneBy({id: dto.deliveryTypeId}) : null
        }
        if (dto.assignedEmployeeId !== undefined) {
            order.assignedEmployee = dto.assignedEmployeeId
                ? await this.employeeRepo.findOneBy({id: dto.assignedEmployeeId})
                : null
        }
        if (dto.clientName !== undefined) order.clientName = dto.clientName
        if (dto.phone !== undefined) order.phone = dto.phone
        if (dto.comment !== undefined) order.comment = dto.comment
        if (dto.deliveryPrice !== undefined) {
            order.deliveryPrice = dto.deliveryPrice
            order.total = order.subtotal - order.discountTotal + order.deliveryPrice
        }

        await this.repo.save(order)
        return this.findOne(id)
    }

    remove(id: number) {
        return this.repo.delete(id)
    }

    async findAllForAdmin(filters: FilterAdminOrdersDto = {}) {
        const {page, pageSize, skip} = this.normalizePagination(filters.page, filters.pageSize)
        const query = this.repo
            .createQueryBuilder("order")
            .leftJoinAndSelect("order.status", "status")
            .leftJoinAndSelect("order.paymentMethod", "paymentMethod")
            .leftJoinAndSelect("order.source", "source")
            .leftJoinAndSelect("order.deliveryType", "deliveryType")
            .leftJoinAndSelect("order.assignedEmployee", "assignedEmployee")
            .leftJoinAndSelect("order.client", "client")
            .leftJoinAndSelect("order.clientAddress", "clientAddress")
            .loadRelationCountAndMap("order.itemsCount", "order.items")

        if (filters.search?.trim()) {
            const search = `%${filters.search.trim()}%`
            query.andWhere(
                "(order.orderNumber LIKE :search OR order.phone LIKE :search OR order.clientName LIKE :search OR client.phone LIKE :search OR client.name LIKE :search)",
                {search}
            )
        }
        if (filters.statusId) query.andWhere("status.id = :statusId", {statusId: filters.statusId})
        if (filters.paymentMethodId) {
            query.andWhere("paymentMethod.id = :paymentMethodId", {paymentMethodId: filters.paymentMethodId})
        }
        if (filters.sourceId) query.andWhere("source.id = :sourceId", {sourceId: filters.sourceId})
        if (filters.paymentStatus)
            query.andWhere("order.paymentStatus = :paymentStatus", {paymentStatus: filters.paymentStatus})
        if (filters.deliveryStatus)
            query.andWhere("order.deliveryStatus = :deliveryStatus", {deliveryStatus: filters.deliveryStatus})
        if (filters.from)
            query.andWhere("order.createdAt >= :from", {from: this.parseDateFilter(filters.from, "start")})
        if (filters.to) query.andWhere("order.createdAt <= :to", {to: this.parseDateFilter(filters.to, "end")})
        if (filters.problemOnly) this.applyProblemOrdersCondition(query)
        if (filters.attentionOnly) this.applyAttentionOrdersCondition(query)

        const total = await query.clone().getCount()
        const {entities, raw} = await query
            .addSelect(this.lastStatusChangedAtSql(), "lastStatusChangedAt")
            .orderBy("order.id", "DESC")
            .skip(skip)
            .take(pageSize)
            .getRawAndEntities()

        const items = entities.map((order, index) => ({
            ...order,
            sla: this.getOrderSlaSnapshot(order, raw[index]?.lastStatusChangedAt)
        }))

        return {items, total, page, pageSize}
    }

    async getAdminSummary() {
        const now = new Date()
        const start = new Date(now)
        start.setHours(0, 0, 0, 0)
        const end = new Date(now)
        end.setHours(23, 59, 59, 999)
        const problemQuery = this.repo
            .createQueryBuilder("order")
            .where("order.createdAt BETWEEN :start AND :end", {start, end})
        this.applyProblemOrdersCondition(problemQuery)

        const [ordersToday, newOrders, inProgressToday, readyToday, problemToday, revenueToday, recentActivity] =
            await Promise.all([
                this.repo.count({where: {createdAt: Between(start, end)}}),
                this.repo.count({where: {createdAt: Between(start, end), deliveryStatus: OrderDeliveryStatus.PENDING}}),
                this.repo.count({
                    where: {createdAt: Between(start, end), deliveryStatus: OrderDeliveryStatus.PREPARING}
                }),
                this.repo.count({where: {createdAt: Between(start, end), deliveryStatus: OrderDeliveryStatus.READY}}),
                problemQuery.getCount(),
                this.repo
                    .createQueryBuilder("order")
                    .select("COALESCE(SUM(order.total), 0)", "sum")
                    .where("order.createdAt BETWEEN :start AND :end", {start, end})
                    .andWhere("order.deliveryStatus != :cancelled", {cancelled: OrderDeliveryStatus.CANCELLED})
                    .getRawOne(),
                this.historyRepo.find({
                    relations: {order: true, fromStatus: true, toStatus: true, employee: true},
                    order: {changedAt: "DESC", id: "DESC"},
                    take: 10
                })
            ])

        return {
            ordersToday,
            newOrders,
            inProgressToday,
            readyToday,
            problemToday,
            revenueToday: Number(revenueToday?.sum || 0),
            recentActivity: recentActivity.map((item) => ({
                id: item.id,
                orderId: item.order?.id,
                orderNumber: item.order?.orderNumber,
                event: item.comment || "Order status changed",
                changedBy: item.changedBy,
                changedAt: item.changedAt,
                fromStatus: item.fromStatus?.title,
                toStatus: item.toStatus?.title
            }))
        }
    }

    async updateStatus(id: number, dto: UpdateOrderStatusDto, admin: AdminAuthenticatedUser | null) {
        const order = await this.getOrderOrFail(id)
        const nextStatus = await this.statusRepo.findOneBy({id: dto.statusId})
        if (!nextStatus) throw new BadRequestException("Order status not found")

        const previousStatus = order.status
        await this.assertTransitionAllowed(previousStatus.id, nextStatus.id)
        const previousDeliveryStatus = order.deliveryStatus
        order.status = nextStatus
        order.deliveryStatus = this.mapStatusToDeliveryStatus(nextStatus)

        if (!order.confirmedAt && order.deliveryStatus !== OrderDeliveryStatus.PENDING) {
            order.confirmedAt = new Date()
        }
        if (order.deliveryStatus === OrderDeliveryStatus.DELIVERED) {
            order.completedAt = new Date()
        }
        if (order.deliveryStatus === OrderDeliveryStatus.CANCELLED) {
            order.cancelledAt = new Date()
        }

        await this.repo.save(order)
        await this.applyInventoryTransition(order, previousDeliveryStatus, order.deliveryStatus)
        await this.applyBonusTransition(order, previousDeliveryStatus, order.deliveryStatus)

        const employee = admin?.id ? await this.employeeRepo.findOneBy({id: admin.id}) : null
        await this.historyRepo.save(
            this.historyRepo.create({
                order,
                fromStatus: previousStatus,
                toStatus: nextStatus,
                employee,
                changedBy: admin ? `${admin.firstName} ${admin.lastName}`.trim() || admin.email : "system",
                comment: dto.comment || null,
                visibleForClient: dto.visibleForClient !== false
            })
        )
        const updatedOrder = await this.getOrderOrFail(id)
        await this.notificationService.enqueueForOrderStatus(updatedOrder, nextStatus)
        await this.enqueueDatraOrderEvent(updatedOrder, "order_status_changed")

        return this.findOne(id)
    }

    async cancel(id: number, dto: CancelOrderDto, admin: AdminAuthenticatedUser | null) {
        const statuses = await this.statusRepo.find({order: {position: "ASC", id: "ASC"}})
        const cancelStatus =
            statuses.find((status) => status.title.toLowerCase().includes("cancel")) ||
            statuses.find((status) => status.title.toLowerCase().includes("отмен"))

        const order = await this.getOrderOrFail(id)
        const previousStatus = order.status
        const previousDeliveryStatus = order.deliveryStatus
        order.deliveryStatus = OrderDeliveryStatus.CANCELLED
        order.cancelReason = dto.reason || null
        order.cancelledAt = new Date()
        if (cancelStatus) order.status = cancelStatus
        await this.repo.save(order)
        await this.applyInventoryTransition(order, previousDeliveryStatus, OrderDeliveryStatus.CANCELLED)
        await this.applyBonusTransition(order, previousDeliveryStatus, OrderDeliveryStatus.CANCELLED)

        await this.historyRepo.save(
            this.historyRepo.create({
                order,
                fromStatus: previousStatus,
                toStatus: order.status,
                employee: admin?.id ? await this.employeeRepo.findOneBy({id: admin.id}) : null,
                changedBy: admin ? `${admin.firstName} ${admin.lastName}`.trim() || admin.email : "system",
                comment: dto.reason || "Order cancelled",
                visibleForClient: true
            })
        )
        const cancelledOrder = await this.getOrderOrFail(id)
        await this.notificationService.enqueueForOrderStatus(cancelledOrder, order.status)
        await this.enqueueDatraOrderEvent(cancelledOrder, "order_cancelled")

        return this.findOne(id)
    }

    async addComment(id: number, dto: CreateOrderCommentDto, admin: AdminAuthenticatedUser) {
        const order = await this.getOrderOrFail(id)
        const employee = await this.employeeRepo.findOneBy({id: admin.id})
        const comment = this.commentRepo.create({
            order,
            employee,
            message: dto.message.trim(),
            visibleForClient: dto.visibleForClient === true
        })

        await this.commentRepo.save(comment)
        return this.findOne(id)
    }

    async getHistory(id: number) {
        await this.getOrderOrFail(id)
        return this.historyRepo.find({
            where: {order: {id}},
            relations: {fromStatus: true, toStatus: true, employee: true},
            order: {id: "ASC"}
        })
    }
}

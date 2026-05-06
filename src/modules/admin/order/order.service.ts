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
import {OrderStatusNotificationService} from "../order-status-notification/order-status-notification.service"
import {ClientEntity} from "../client/entities/client.entity"
import {
    ClientBonusTransactionEntity,
    ClientBonusTransactionType
} from "../client/entities/client-bonus-transaction.entity"

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
        @InjectRepository(ClientEntity)
        private readonly clientRepo: Repository<ClientEntity>,
        @InjectRepository(ClientBonusTransactionEntity)
        private readonly bonusTransactionRepo: Repository<ClientBonusTransactionEntity>,
        private readonly notificationService: OrderStatusNotificationService
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
            date.setHours(boundary === "start" ? 0 : 23, boundary === "start" ? 0 : 59, boundary === "start" ? 0 : 59, boundary === "start" ? 0 : 999)
        }

        return date
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

    private async applyInventoryTransition(order: OrderEntity, previous: OrderDeliveryStatus, next: OrderDeliveryStatus) {
        if (previous === next) return
        if (![OrderDeliveryStatus.CANCELLED, OrderDeliveryStatus.DELIVERED].includes(next)) return
        if ([OrderDeliveryStatus.CANCELLED, OrderDeliveryStatus.DELIVERED].includes(previous)) return

        const fullOrder = await this.repo.findOne({
            where: {id: order.id},
            relations: {
                items: {
                    size: true
                }
            }
        })

        for (const item of fullOrder?.items || []) {
            if (!item.size) continue
            const variantSize = await this.productVariantSizeRepo.findOneBy({id: item.size.id})
            if (!variantSize) continue

            variantSize.reservedQty = Math.max(Number(variantSize.reservedQty || 0) - item.qty, 0)
            if (next === OrderDeliveryStatus.DELIVERED) {
                variantSize.soldQty = Number(variantSize.soldQty || 0) + item.qty
            }
            await this.productVariantSizeRepo.save(variantSize)
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
        const title = status.title.toLowerCase()
        if (title.includes("cancel") || title.includes("отмен")) return OrderDeliveryStatus.CANCELLED
        if (title.includes("deliver") || title.includes("достав")) return OrderDeliveryStatus.DELIVERING
        if (title.includes("ready") || title.includes("готов")) return OrderDeliveryStatus.READY
        if (title.includes("complete") || title.includes("done") || title.includes("заверш")) {
            return OrderDeliveryStatus.DELIVERED
        }
        if (title.includes("confirm") || title.includes("подтверж")) return OrderDeliveryStatus.PREPARING
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

        return this.findOne(entity.id)
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
            order.paymentMethod = dto.paymentMethodId ? await this.paymentRepo.findOneBy({id: dto.paymentMethodId}) : null
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
        if (filters.paymentStatus) query.andWhere("order.paymentStatus = :paymentStatus", {paymentStatus: filters.paymentStatus})
        if (filters.deliveryStatus) query.andWhere("order.deliveryStatus = :deliveryStatus", {deliveryStatus: filters.deliveryStatus})
        if (filters.from) query.andWhere("order.createdAt >= :from", {from: this.parseDateFilter(filters.from, "start")})
        if (filters.to) query.andWhere("order.createdAt <= :to", {to: this.parseDateFilter(filters.to, "end")})

        const [items, total] = await query.orderBy("order.id", "DESC").skip(skip).take(pageSize).getManyAndCount()

        return {items, total, page, pageSize}
    }

    async getAdminSummary() {
        const now = new Date()
        const start = new Date(now)
        start.setHours(0, 0, 0, 0)
        const end = new Date(now)
        end.setHours(23, 59, 59, 999)
        const [ordersToday, newOrders, revenueToday] = await Promise.all([
            this.repo.count({where: {createdAt: Between(start, end)}}),
            this.repo.count({where: {deliveryStatus: OrderDeliveryStatus.PENDING}}),
            this.repo
                .createQueryBuilder("order")
                .select("COALESCE(SUM(order.total), 0)", "sum")
                .where("order.createdAt BETWEEN :start AND :end", {start, end})
                .andWhere("order.deliveryStatus != :cancelled", {cancelled: OrderDeliveryStatus.CANCELLED})
                .getRawOne()
        ])

        return {
            ordersToday,
            newOrders,
            revenueToday: Number(revenueToday?.sum || 0)
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
        await this.notificationService.enqueueForOrderStatus(await this.getOrderOrFail(id), nextStatus)

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
        await this.notificationService.enqueueForOrderStatus(await this.getOrderOrFail(id), order.status)

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

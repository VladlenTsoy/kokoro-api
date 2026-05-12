import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnauthorizedException
} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {DataSource, Repository} from "typeorm"
import {randomBytes} from "crypto"
import {CreateClientOrderClientDto, CreateClientOrderDto} from "./dto/create-client-order.dto"
import {ClientEntity} from "../../admin/client/entities/client.entity"
import {ClientAddressEntity} from "../../admin/client-address/entities/client-address.entity"
import {OrderDeliveryStatus, OrderEntity, OrderPaymentStatus} from "../../admin/order/entities/order.entity"
import {OrderItemEntity} from "../../admin/order-item/entities/order-item.entity"
import {OrderStatusEntity} from "../../admin/order-status/entities/order-status.entity"
import {PaymentMethodEntity} from "../../admin/payment-method/entities/payment-method.entity"
import {SourceEntity} from "../../admin/source/entities/source.entity"
import {DeliveryTypeEntity} from "../../admin/delivery-type/entities/delivery-type.entity"
import {ProductVariantEntity} from "../../admin/product-variant/entities/product-variant.entity"
import {OrderStatusHistoryEntity} from "../../admin/order-status-history/entities/order-status-history.entity"
import {ProductVariantSizeEntity} from "../../admin/product-variant-size/entities/product-variant-size.entity"
import {PromoCodeDiscountType, PromoCodeEntity} from "../../admin/promo-code/entities/promo-code.entity"
import {
    ClientBonusTransactionEntity,
    ClientBonusTransactionType
} from "../../admin/client/entities/client-bonus-transaction.entity"
import {IntegrationService} from "../../admin/integration/integration.service"
import {IntegrationProviderKey} from "../../admin/integration/entities/integration-setting.entity"

@Injectable()
export class ClientOrderService {
    private readonly cdnBaseUrl = "https://kokoro-app.ams3.cdn.digitaloceanspaces.com/"

    constructor(
        private readonly dataSource: DataSource,
        @InjectRepository(OrderEntity)
        private readonly orderRepository: Repository<OrderEntity>,
        @InjectRepository(OrderStatusHistoryEntity)
        private readonly historyRepository: Repository<OrderStatusHistoryEntity>,
        private readonly integrationService: IntegrationService
    ) {}

    private buildCustomerIntegrationPayload(client: ClientEntity, eventName: string) {
        return {
            eventId: `${eventName}-kokoro-client-${client.id}`,
            idempotencyKey: `${eventName}-kokoro-client-${client.id}-${Date.now()}`,
            externalId: `kokoro-client-${client.id}`,
            customerId: client.id,
            name: client.name,
            phone: client.phone,
            isActive: client.isActive,
            bonusBalance: client.bonusBalance,
            createdAt: client.createdAt,
            lastLoginAt: client.lastLoginAt || null
        }
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
            sourcePlatform: order.source?.title || "client",
            createdAt: order.createdAt,
            completedAt: order.completedAt,
            cancelledAt: order.cancelledAt
        }
    }

    private async enqueueDatraCustomerEvent(client: ClientEntity, eventName: string) {
        await this.integrationService.enqueue(
            IntegrationProviderKey.DATRA_CDP,
            eventName,
            this.buildCustomerIntegrationPayload(client, eventName)
        )
    }

    private async enqueueDatraOrderEvent(order: OrderEntity, eventName: string) {
        await this.integrationService.enqueue(
            IntegrationProviderKey.DATRA_CDP,
            eventName,
            this.buildOrderIntegrationPayload(order, eventName)
        )
    }

    private normalizePhone(phone: string) {
        return phone.replace(/\s+/g, "").trim()
    }

    private stableSerialize(value: any): string {
        if (value === null || value === undefined) return ""
        if (Array.isArray(value)) return `[${value.map((item) => this.stableSerialize(item)).join(",")}]`
        if (typeof value === "object") {
            return `{${Object.keys(value)
                .sort()
                .map((key) => `${JSON.stringify(key)}:${this.stableSerialize(value[key])}`)
                .join(",")}}`
        }
        return JSON.stringify(value)
    }

    private toFullImageUrl(path?: string | null) {
        if (!path) return path
        if (/^https?:\/\//i.test(path)) return path
        const base = this.cdnBaseUrl.endsWith("/") ? this.cdnBaseUrl : `${this.cdnBaseUrl}/`
        const cleanPath = path.startsWith("/") ? path.slice(1) : path
        return `${base}${cleanPath}`
    }

    private buildOrderNumber(orderId: number) {
        return `KO-${String(orderId).padStart(6, "0")}`
    }

    private createOrderAccessToken() {
        return randomBytes(32).toString("base64url")
    }

    private normalizePromoCode(code?: string) {
        return code?.trim().toUpperCase() || null
    }

    private calculatePromoDiscount(promoCode: PromoCodeEntity, baseTotal: number) {
        if (promoCode.discountType === PromoCodeDiscountType.PERCENT) {
            return Math.round((baseTotal * promoCode.discountValue) / 100)
        }

        return Math.min(promoCode.discountValue, baseTotal)
    }

    private calculateBonusEarned(baseTotal: number) {
        const percent = Number(process.env.CLIENT_ORDER_BONUS_PERCENT || 1)
        if (percent <= 0) return 0
        return Math.floor((baseTotal * percent) / 100)
    }

    private isDiscountActive(discount?: {startDate?: Date | null; endDate?: Date | null} | null) {
        if (!discount) return false
        const now = Date.now()
        const start = discount.startDate ? new Date(discount.startDate).getTime() : null
        const end = discount.endDate ? new Date(discount.endDate).getTime() : null

        if (start && now < start) return false
        if (end && now > end) return false

        return true
    }

    private enrichOrderForClient(order: OrderEntity | null) {
        if (!order) return null

        const normalizedItems = (order.items || []).map((item) => {
            const finalPrice = Math.max(item.price - item.discount, 0)
            const lineTotal = finalPrice * item.qty
            const images = [...(item.productVariant?.images || [])].sort(
                (a: any, b: any) => Number(a?.position || 0) - Number(b?.position || 0)
            )
            const mainImage = images.length ? this.toFullImageUrl(images[0].path) : null

            return {
                ...item,
                finalPrice,
                lineTotal,
                productVariant: item.productVariant
                    ? {
                          ...item.productVariant,
                          image: mainImage
                      }
                    : item.productVariant
            }
        })

        return {
            id: order.id,
            orderNumber: order.orderNumber,
            total: order.total,
            subtotal: order.subtotal,
            discountTotal: order.discountTotal,
            deliveryPrice: order.deliveryPrice,
            promoCode: order.promoCode || null,
            promoDiscount: order.promoDiscount || 0,
            bonusSpent: order.bonusSpent || 0,
            bonusEarned: order.bonusEarned || 0,
            paymentStatus: order.paymentStatus,
            deliveryStatus: order.deliveryStatus,
            cancelReason: order.cancelReason || null,
            accessToken: order.accessToken || null,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            status: order.status,
            paymentMethod: order.paymentMethod || null,
            deliveryType: order.deliveryType || null,
            client: order.client
                ? {
                      id: order.client.id,
                      name: order.client.name,
                      phone: order.client.phone
                  }
                : {
                      name: order.clientName,
                      phone: order.phone
                  },
            address: order.clientAddress
                ? {
                      id: order.clientAddress.id,
                      address: order.clientAddress.address,
                      location: order.clientAddress.location
                  }
                : null,
            histories: (order.histories || [])
                .filter((history) => history.visibleForClient)
                .map((history) => ({
                    id: history.id,
                    fromStatus: history.fromStatus || null,
                    toStatus: history.toStatus,
                    comment: history.comment || null,
                    changedAt: history.changedAt
                })),
            items: normalizedItems
        }
    }

    async create(dto: CreateClientOrderDto, authenticatedClientId?: number) {
        if (!dto.items?.length) {
            throw new BadRequestException("Order items are required")
        }

        const resolveGuestClientData = (guestClient?: CreateClientOrderClientDto) => {
            if (!guestClient?.phone?.trim() || !guestClient?.name?.trim()) {
                throw new BadRequestException("Client name and phone are required for guest checkout")
            }

            return {
                phone: this.normalizePhone(guestClient.phone),
                name: guestClient.name.trim()
            }
        }

        const result = await this.dataSource.transaction(async (manager) => {
            const clientRepository = manager.getRepository(ClientEntity)
            const clientAddressRepository = manager.getRepository(ClientAddressEntity)
            const orderRepository = manager.getRepository(OrderEntity)
            const orderItemRepository = manager.getRepository(OrderItemEntity)
            const orderStatusRepository = manager.getRepository(OrderStatusEntity)
            const historyRepository = manager.getRepository(OrderStatusHistoryEntity)
            const paymentRepository = manager.getRepository(PaymentMethodEntity)
            const sourceRepository = manager.getRepository(SourceEntity)
            const deliveryRepository = manager.getRepository(DeliveryTypeEntity)
            const productVariantRepository = manager.getRepository(ProductVariantEntity)
            const productVariantSizeRepository = manager.getRepository(ProductVariantSizeEntity)
            const promoCodeRepository = manager.getRepository(PromoCodeEntity)
            const bonusTransactionRepository = manager.getRepository(ClientBonusTransactionEntity)

            let client: ClientEntity | null = null
            let createdClient = false
            let phone: string | null = null
            let clientName: string | null = null

            if (authenticatedClientId) {
                client = await clientRepository.findOne({where: {id: authenticatedClientId}})
                if (!client || !client.isActive) {
                    throw new UnauthorizedException("Client is not active")
                }

                phone = client.phone || null
                clientName = client.name
            } else {
                const guestClient = resolveGuestClientData(dto.client)
                phone = guestClient.phone
                clientName = guestClient.name
                client = await clientRepository.findOne({where: {phone}})

                if (!client) {
                    client = clientRepository.create({
                        name: guestClient.name,
                        phone
                    })
                    client = await clientRepository.save(client)
                    createdClient = true
                } else if (client.name !== guestClient.name) {
                    client.name = guestClient.name
                    client = await clientRepository.save(client)
                }
            }

            const locationHash = this.stableSerialize(dto.address.location || null)

            let clientAddress = await clientAddressRepository.findOne({
                where: {
                    client: {id: client.id},
                    locationHash
                },
                relations: {client: true}
            })

            if (!clientAddress) {
                clientAddress = clientAddressRepository.create({
                    client,
                    address: dto.address.address.trim(),
                    location: dto.address.location || null,
                    locationHash
                })
                clientAddress = await clientAddressRepository.save(clientAddress)
            } else if (clientAddress.address !== dto.address.address.trim()) {
                clientAddress.address = dto.address.address.trim()
                clientAddress.location = dto.address.location || null
                clientAddress = await clientAddressRepository.save(clientAddress)
            }

            const statuses = await orderStatusRepository.find({
                order: {
                    position: "ASC",
                    id: "ASC"
                },
                take: 1
            })
            const orderStatus = statuses[0]

            if (!orderStatus) {
                throw new BadRequestException("Order status is not configured")
            }

            const paymentMethod = dto.paymentMethodId
                ? await paymentRepository.findOneBy({id: dto.paymentMethodId})
                : null
            const source = dto.sourceId ? await sourceRepository.findOneBy({id: dto.sourceId}) : null
            const deliveryType = dto.deliveryTypeId
                ? await deliveryRepository.findOneBy({id: dto.deliveryTypeId})
                : null

            const preparedItems: Array<{
                variant: ProductVariantEntity
                size: ProductVariantSizeEntity | null
                qty: number
                price: number
                discount: number
                promotion: boolean
            }> = []

            for (const item of dto.items) {
                let variant = await productVariantRepository.findOne({
                    where: {id: item.productVariantId},
                    relations: {discount: true, color: true, product: true, images: true, sizes: {size: true}}
                })

                if (!variant) {
                    throw new NotFoundException(`Product variant ${item.productVariantId} not found`)
                }
                if (variant.status_id !== 2) {
                    throw new BadRequestException(
                        `Product variant ${item.productVariantId} is not available for checkout`
                    )
                }

                const basePrice = Number(variant.price)
                const discountActive = this.isDiscountActive(variant.discount)
                const discountPercent = discountActive ? Number(variant.discount?.discountPercent || 0) : 0
                const unitDiscount = Math.round((basePrice * discountPercent) / 100)
                let selectedSize: ProductVariantSizeEntity | null = null
                const availableSizes = variant.sizes || []

                if (availableSizes.length) {
                    if (!item.sizeId) {
                        throw new BadRequestException(`Size is required for product variant ${item.productVariantId}`)
                    }

                    selectedSize = await productVariantSizeRepository.findOne({
                        where: {id: item.sizeId},
                        relations: {productVariant: true, size: true},
                        lock: {mode: "pessimistic_write"}
                    })

                    if (!selectedSize || selectedSize.productVariant.id !== variant.id) {
                        throw new BadRequestException(
                            `Size ${item.sizeId} is not available for product variant ${item.productVariantId}`
                        )
                    }

                    const availableQty = Number(selectedSize.qty || 0) - Number(selectedSize.reservedQty || 0)
                    if (availableQty < item.qty) {
                        throw new BadRequestException(
                            `Only ${Math.max(availableQty, 0)} item(s) left for selected size`
                        )
                    }

                    selectedSize.reservedQty = Number(selectedSize.reservedQty || 0) + item.qty
                    await productVariantSizeRepository.save(selectedSize)
                } else if (variant.qty !== null && variant.qty !== undefined) {
                    const lockedVariant = await productVariantRepository.findOne({
                        where: {id: variant.id},
                        relations: {discount: true, color: true, product: true, images: true, sizes: {size: true}},
                        lock: {mode: "pessimistic_write"}
                    })
                    if (!lockedVariant) {
                        throw new NotFoundException(`Product variant ${item.productVariantId} not found`)
                    }

                    const availableQty = Number(lockedVariant.qty || 0) - Number(lockedVariant.reservedQty || 0)
                    if (availableQty < item.qty) {
                        throw new BadRequestException(
                            `Only ${Math.max(availableQty, 0)} item(s) left for selected product variant`
                        )
                    }

                    lockedVariant.reservedQty = Number(lockedVariant.reservedQty || 0) + item.qty
                    await productVariantRepository.save(lockedVariant)
                    variant = lockedVariant
                }

                preparedItems.push({
                    variant,
                    size: selectedSize,
                    qty: item.qty,
                    price: basePrice,
                    discount: unitDiscount,
                    promotion: unitDiscount > 0
                })
            }

            const subtotal = preparedItems.reduce((sum, item) => sum + item.price * item.qty, 0)
            const discountTotal = preparedItems.reduce((sum, item) => sum + item.discount * item.qty, 0)
            const deliveryPrice = Number(deliveryType?.price || 0)
            const itemsTotal = Math.max(subtotal - discountTotal, 0)
            let promoCode: PromoCodeEntity | null = null
            let promoDiscount = 0
            let bonusSpent = 0

            const normalizedPromoCode = this.normalizePromoCode(dto.promoCode)
            if (normalizedPromoCode) {
                promoCode = await promoCodeRepository.findOne({where: {code: normalizedPromoCode}})
                const now = Date.now()

                if (!promoCode || !promoCode.isActive) {
                    throw new BadRequestException("Promo code is not active")
                }
                if (promoCode.startsAt && new Date(promoCode.startsAt).getTime() > now) {
                    throw new BadRequestException("Promo code is not active yet")
                }
                if (promoCode.endsAt && new Date(promoCode.endsAt).getTime() < now) {
                    throw new BadRequestException("Promo code is expired")
                }
                if (promoCode.usageLimit && promoCode.usedCount >= promoCode.usageLimit) {
                    throw new BadRequestException("Promo code usage limit exceeded")
                }
                if (itemsTotal < Number(promoCode.minOrderTotal || 0)) {
                    throw new BadRequestException("Order total is too low for promo code")
                }

                promoDiscount = this.calculatePromoDiscount(promoCode, itemsTotal)
                promoCode.usedCount = Number(promoCode.usedCount || 0) + 1
                await promoCodeRepository.save(promoCode)
            }

            const afterPromoTotal = Math.max(itemsTotal - promoDiscount, 0)
            if (dto.bonusToSpend && dto.bonusToSpend > 0) {
                if (!authenticatedClientId) {
                    throw new BadRequestException("Bonuses are available only for authorized clients")
                }
                if (Number(client.bonusBalance || 0) < dto.bonusToSpend) {
                    throw new BadRequestException("Not enough bonuses")
                }

                bonusSpent = Math.min(dto.bonusToSpend, afterPromoTotal)
                client.bonusBalance = Number(client.bonusBalance || 0) - bonusSpent
                await clientRepository.save(client)
            }

            const bonusEarned = authenticatedClientId
                ? this.calculateBonusEarned(Math.max(afterPromoTotal - bonusSpent, 0))
                : 0

            let order = orderRepository.create({
                status: orderStatus,
                paymentMethod,
                source,
                deliveryType,
                subtotal,
                discountTotal,
                deliveryPrice,
                promoCode: promoCode?.code || null,
                promoDiscount,
                bonusSpent,
                bonusEarned,
                total: Math.max(afterPromoTotal - bonusSpent + deliveryPrice, 0),
                phone,
                clientName: clientName || client.name,
                comment: dto.comment?.trim(),
                client,
                clientAddress,
                accessToken: authenticatedClientId ? null : this.createOrderAccessToken(),
                orderSource: "site",
                paymentStatus: OrderPaymentStatus.PENDING,
                deliveryStatus: OrderDeliveryStatus.PENDING
            })

            order = await orderRepository.save(order)
            order.orderNumber = this.buildOrderNumber(order.id)
            order = await orderRepository.save(order)

            await historyRepository.save(
                historyRepository.create({
                    order,
                    fromStatus: null,
                    toStatus: orderStatus,
                    changedBy: "client",
                    comment: "Order created",
                    visibleForClient: true
                })
            )

            if (bonusSpent > 0) {
                await bonusTransactionRepository.save(
                    bonusTransactionRepository.create({
                        client,
                        order,
                        type: ClientBonusTransactionType.SPEND,
                        amount: -bonusSpent,
                        comment: "Bonuses spent on order"
                    })
                )
            }

            for (const item of preparedItems) {
                const images = [...(item.variant.images || [])].sort(
                    (a: any, b: any) => Number(a?.position || 0) - Number(b?.position || 0)
                )
                const finalUnitPrice = Math.max(item.price - item.discount, 0)
                const orderItem = orderItemRepository.create({
                    order,
                    productVariant: item.variant,
                    size: item.size,
                    qty: item.qty,
                    price: item.price,
                    discount: item.discount,
                    promotion: item.promotion,
                    productName: item.variant.product ? `Product #${item.variant.product.id}` : null,
                    variantName: item.variant.title,
                    sku: `PV-${item.variant.id}`,
                    colorName: item.variant.color?.title || null,
                    sizeName: item.size?.size?.title || null,
                    imageUrl: images.length ? this.toFullImageUrl(images[0].path) : null,
                    unitPrice: item.price,
                    finalUnitPrice,
                    lineTotal: finalUnitPrice * item.qty
                })

                await orderItemRepository.save(orderItem)
            }

            return {orderId: order.id, createdClientId: createdClient ? client.id : null}
        })

        const order = await this.orderRepository.findOne({
            where: {id: result.orderId},
            relations: {
                status: true,
                paymentMethod: true,
                source: true,
                deliveryType: true,
                client: true,
                clientAddress: true,
                histories: {
                    fromStatus: true,
                    toStatus: true
                },
                items: {
                    productVariant: {
                        discount: true,
                        images: true
                    },
                    size: true
                }
            }
        })

        if (order?.client && result.createdClientId) {
            await this.enqueueDatraCustomerEvent(order.client, "customer_created")
        }
        if (order) {
            await this.enqueueDatraOrderEvent(order, "order_created")
        }

        return this.enrichOrderForClient(order)
    }

    async findAllForClient(clientId: number, page = 1, pageSize = 20) {
        const safePage = Number(page) > 0 ? Number(page) : 1
        const safePageSize = Number(pageSize) > 0 ? Math.min(Number(pageSize), 100) : 20
        const [items, total] = await this.orderRepository.findAndCount({
            where: {client: {id: clientId}},
            relations: {
                status: true,
                paymentMethod: true,
                deliveryType: true,
                client: true,
                clientAddress: true,
                items: {
                    productVariant: {
                        images: true
                    },
                    size: true
                }
            },
            order: {id: "DESC"},
            skip: (safePage - 1) * safePageSize,
            take: safePageSize
        })

        return {
            items: items.map((order) => this.enrichOrderForClient(order)),
            total,
            page: safePage,
            pageSize: safePageSize
        }
    }

    async findOneForClient(id: number, authenticatedClientId?: number, accessToken?: string) {
        const order = await this.orderRepository.findOne({
            where: {id},
            relations: {
                status: true,
                paymentMethod: true,
                deliveryType: true,
                client: true,
                clientAddress: true,
                histories: {
                    fromStatus: true,
                    toStatus: true
                },
                items: {
                    productVariant: {
                        images: true
                    },
                    size: true
                }
            }
        })

        if (!order) {
            throw new NotFoundException("Order not found")
        }

        const isOwner = authenticatedClientId && order.client?.id === authenticatedClientId
        const isGuestWithToken = accessToken && order.accessToken && accessToken === order.accessToken

        if (!isOwner && !isGuestWithToken) {
            throw new ForbiddenException("Order is not available")
        }

        return this.enrichOrderForClient(order)
    }

    async cancelForClient(
        id: number,
        authenticatedClientId: number | undefined,
        accessToken: string | undefined,
        reason?: string
    ) {
        const order = await this.orderRepository.findOne({
            where: {id},
            relations: {status: true, client: true}
        })

        if (!order) throw new NotFoundException("Order not found")
        const isOwner = authenticatedClientId && order.client?.id === authenticatedClientId
        const isGuestWithToken = accessToken && order.accessToken && accessToken === order.accessToken
        if (!isOwner && !isGuestWithToken) throw new ForbiddenException("Order is not available")
        if (order.deliveryStatus !== OrderDeliveryStatus.PENDING) {
            throw new BadRequestException("Order can no longer be cancelled by client")
        }

        order.deliveryStatus = OrderDeliveryStatus.CANCELLED
        order.cancelReason = reason || "Cancelled by client"
        order.cancelledAt = new Date()
        await this.orderRepository.save(order)
        if (order.client && order.bonusSpent > 0) {
            const clientRepository = this.dataSource.getRepository(ClientEntity)
            const bonusTransactionRepository = this.dataSource.getRepository(ClientBonusTransactionEntity)
            const client = await clientRepository.findOneBy({id: order.client.id})
            if (client) {
                client.bonusBalance = Number(client.bonusBalance || 0) + order.bonusSpent
                await clientRepository.save(client)
                await bonusTransactionRepository.save(
                    bonusTransactionRepository.create({
                        client,
                        order,
                        type: ClientBonusTransactionType.REFUND,
                        amount: order.bonusSpent,
                        comment: "Bonuses refunded after order cancellation"
                    })
                )
            }
        }
        const items = await this.orderRepository.findOne({
            where: {id},
            relations: {items: {productVariant: true, size: true}}
        })
        const sizeRepository = this.dataSource.getRepository(ProductVariantSizeEntity)
        const productVariantRepository = this.dataSource.getRepository(ProductVariantEntity)
        for (const item of items?.items || []) {
            if (item.size) {
                const variantSize = await sizeRepository.findOneBy({id: item.size.id})
                if (!variantSize) continue
                variantSize.reservedQty = Math.max(Number(variantSize.reservedQty || 0) - item.qty, 0)
                await sizeRepository.save(variantSize)
                continue
            }

            if (!item.productVariant) continue
            const variant = await productVariantRepository.findOneBy({id: item.productVariant.id})
            if (!variant || variant.qty === null || variant.qty === undefined) continue
            variant.reservedQty = Math.max(Number(variant.reservedQty || 0) - item.qty, 0)
            await productVariantRepository.save(variant)
        }
        await this.historyRepository.save(
            this.historyRepository.create({
                order,
                fromStatus: order.status,
                toStatus: order.status,
                changedBy: "client",
                comment: order.cancelReason,
                visibleForClient: true
            })
        )
        await this.enqueueDatraOrderEvent(order, "order_cancelled")

        return this.findOneForClient(id, authenticatedClientId, accessToken)
    }

    async reorder(id: number, clientId: number) {
        const order = await this.orderRepository.findOne({
            where: {id, client: {id: clientId}},
            relations: {
                clientAddress: true,
                paymentMethod: true,
                deliveryType: true,
                items: {
                    productVariant: true
                }
            }
        })

        if (!order) throw new NotFoundException("Order not found")

        return {
            address: order.clientAddress
                ? {
                      address: order.clientAddress.address,
                      location: order.clientAddress.location
                  }
                : null,
            items: (order.items || []).map((item) => ({
                productVariantId: item.productVariant.id,
                qty: item.qty
            })),
            comment: order.comment || undefined,
            paymentMethodId: order.paymentMethod?.id,
            deliveryTypeId: order.deliveryType?.id
        }
    }
}

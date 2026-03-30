import {BadRequestException, Injectable, NotFoundException} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {DataSource, Repository} from "typeorm"
import {CreateClientOrderDto} from "./dto/create-client-order.dto"
import {ClientEntity} from "../../admin/client/entities/client.entity"
import {ClientAddressEntity} from "../../admin/client-address/entities/client-address.entity"
import {OrderEntity} from "../../admin/order/entities/order.entity"
import {OrderItemEntity} from "../../admin/order-item/entities/order-item.entity"
import {OrderStatusEntity} from "../../admin/order-status/entities/order-status.entity"
import {PaymentMethodEntity} from "../../admin/payment-method/entities/payment-method.entity"
import {SourceEntity} from "../../admin/source/entities/source.entity"
import {DeliveryTypeEntity} from "../../admin/delivery-type/entities/delivery-type.entity"
import {ProductVariantEntity} from "../../admin/product-variant/entities/product-variant.entity"

@Injectable()
export class ClientOrderService {
    private readonly cdnBaseUrl = "https://kokoro-app.ams3.cdn.digitaloceanspaces.com/"

    constructor(
        private readonly dataSource: DataSource,
        @InjectRepository(OrderEntity)
        private readonly orderRepository: Repository<OrderEntity>
    ) {}

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
            total: order.total,
            createdAt: order.createdAt,
            status: order.status,
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
            items: normalizedItems
        }
    }

    async create(dto: CreateClientOrderDto) {
        if (!dto.items?.length) {
            throw new BadRequestException("Order items are required")
        }

        const result = await this.dataSource.transaction(async (manager) => {
            const clientRepository = manager.getRepository(ClientEntity)
            const clientAddressRepository = manager.getRepository(ClientAddressEntity)
            const orderRepository = manager.getRepository(OrderEntity)
            const orderItemRepository = manager.getRepository(OrderItemEntity)
            const orderStatusRepository = manager.getRepository(OrderStatusEntity)
            const paymentRepository = manager.getRepository(PaymentMethodEntity)
            const sourceRepository = manager.getRepository(SourceEntity)
            const deliveryRepository = manager.getRepository(DeliveryTypeEntity)
            const productVariantRepository = manager.getRepository(ProductVariantEntity)

            const phone = this.normalizePhone(dto.client.phone)
            let client = await clientRepository.findOne({where: {phone}})

            if (!client) {
                client = clientRepository.create({
                    name: dto.client.name.trim(),
                    phone
                })
                client = await clientRepository.save(client)
            } else if (client.name !== dto.client.name.trim()) {
                client.name = dto.client.name.trim()
                client = await clientRepository.save(client)
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
            const deliveryType = dto.deliveryTypeId ? await deliveryRepository.findOneBy({id: dto.deliveryTypeId}) : null

            let total = 0
            const preparedItems: Array<{
                variant: ProductVariantEntity
                qty: number
                price: number
                discount: number
                promotion: boolean
            }> = []

            for (const item of dto.items) {
                const variant = await productVariantRepository.findOne({
                    where: {id: item.productVariantId},
                    relations: {discount: true}
                })

                if (!variant) {
                    throw new NotFoundException(`Product variant ${item.productVariantId} not found`)
                }

                const basePrice = Number(variant.price)
                const discountActive = this.isDiscountActive(variant.discount)
                const discountPercent = discountActive ? Number(variant.discount?.discountPercent || 0) : 0
                const unitDiscount = Math.round((basePrice * discountPercent) / 100)
                const finalUnitPrice = Math.max(basePrice - unitDiscount, 0)
                const lineTotal = finalUnitPrice * item.qty
                total += lineTotal

                preparedItems.push({
                    variant,
                    qty: item.qty,
                    price: basePrice,
                    discount: unitDiscount,
                    promotion: unitDiscount > 0
                })
            }

            let order = orderRepository.create({
                status: orderStatus,
                paymentMethod,
                source,
                deliveryType,
                total,
                phone,
                clientName: client.name,
                comment: dto.comment?.trim(),
                client,
                clientAddress
            })

            order = await orderRepository.save(order)

            for (const item of preparedItems) {
                const orderItem = orderItemRepository.create({
                    order,
                    productVariant: item.variant,
                    size: null,
                    qty: item.qty,
                    price: item.price,
                    discount: item.discount,
                    promotion: item.promotion
                })

                await orderItemRepository.save(orderItem)
            }

            return order.id
        })

        const order = await this.orderRepository.findOne({
            where: {id: result},
            relations: {
                status: true,
                paymentMethod: true,
                source: true,
                deliveryType: true,
                client: true,
                clientAddress: true,
                items: {
                    productVariant: {
                        discount: true,
                        images: true
                    },
                    size: true
                }
            }
        })

        return this.enrichOrderForClient(order)
    }

    async findOneForClient(id: number) {
        const order = await this.orderRepository.findOne({
            where: {id},
            relations: {
                status: true,
                client: true,
                clientAddress: true,
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

        return this.enrichOrderForClient(order)
    }
}

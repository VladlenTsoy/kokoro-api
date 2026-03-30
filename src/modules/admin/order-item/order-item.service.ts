import {Injectable, NotFoundException} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {OrderItemEntity} from "./entities/order-item.entity"
import {CreateOrderItemDto} from "./dto/create-order-item.dto"
import {UpdateOrderItemDto} from "./dto/update-order-item.dto"
import {OrderEntity} from "../order/entities/order.entity"
import {ProductVariantEntity} from "../product-variant/entities/product-variant.entity"
import {ProductVariantSizeEntity} from "../product-variant-size/entities/product-variant-size.entity"

@Injectable()
export class OrderItemService {
    constructor(
        @InjectRepository(OrderItemEntity)
        private readonly repo: Repository<OrderItemEntity>,
        @InjectRepository(OrderEntity)
        private readonly orderRepo: Repository<OrderEntity>,
        @InjectRepository(ProductVariantEntity)
        private readonly variantRepo: Repository<ProductVariantEntity>,
        @InjectRepository(ProductVariantSizeEntity)
        private readonly sizeRepo: Repository<ProductVariantSizeEntity>
    ) {}

    private isDiscountActive(discount?: {startDate?: Date | null; endDate?: Date | null} | null) {
        if (!discount) return false
        const now = Date.now()
        const start = discount.startDate ? new Date(discount.startDate).getTime() : null
        const end = discount.endDate ? new Date(discount.endDate).getTime() : null

        if (start && now < start) return false
        if (end && now > end) return false

        return true
    }

    private resolvePricingFromVariant(variant: ProductVariantEntity, qty: number) {
        const basePrice = Number(variant.price)
        const discountActive = this.isDiscountActive(variant.discount as any)
        const discountPercent = discountActive ? Number((variant.discount as any)?.discountPercent || 0) : 0
        const unitDiscount = Math.round((basePrice * discountPercent) / 100)
        const promotion = unitDiscount > 0
        const lineTotal = Math.max(basePrice - unitDiscount, 0) * qty

        return {
            price: basePrice,
            discount: unitDiscount,
            promotion,
            lineTotal
        }
    }

    private async recalculateOrderTotal(orderId: number) {
        const items = await this.repo.find({
            where: {order: {id: orderId}},
            relations: {order: true}
        })

        const total = items.reduce((acc, item) => acc + Math.max(item.price - item.discount, 0) * item.qty, 0)
        await this.orderRepo.update(orderId, {total})
    }

    async create(dto: CreateOrderItemDto) {
        const order = await this.orderRepo.findOneBy({id: dto.orderId})
        if (!order) throw new NotFoundException("Order not found")

        const variant = await this.variantRepo.findOne({
            where: {id: dto.productVariantId},
            relations: {discount: true}
        })
        if (!variant) throw new NotFoundException("Product variant not found")

        const size = await this.sizeRepo.findOneBy({id: dto.sizeId})
        if (!size) throw new NotFoundException("Product variant size not found")

        const pricing = this.resolvePricingFromVariant(variant, dto.qty)

        const entity = this.repo.create({
            order,
            productVariant: variant,
            size,
            qty: dto.qty,
            price: pricing.price,
            promotion: pricing.promotion,
            discount: pricing.discount
        })

        const saved = await this.repo.save(entity)
        await this.recalculateOrderTotal(order.id)

        return saved
    }

    findAll() {
        return this.repo.find({relations: ["order", "productVariant", "size"]})
    }

    findOne(id: number) {
        return this.repo.findOne({where: {id}, relations: ["order", "productVariant", "size"]})
    }

    async update(id: number, dto: UpdateOrderItemDto) {
        const entity = await this.repo.findOne({
            where: {id},
            relations: {order: true, productVariant: {discount: true}, size: true}
        })
        if (!entity) throw new NotFoundException("Order item not found")

        if (dto.orderId !== undefined) {
            const order = await this.orderRepo.findOneBy({id: dto.orderId})
            if (!order) throw new NotFoundException("Order not found")
            entity.order = order
        }
        if (dto.productVariantId !== undefined) {
            const variant = await this.variantRepo.findOne({
                where: {id: dto.productVariantId},
                relations: {discount: true}
            })
            if (!variant) throw new NotFoundException("Product variant not found")
            entity.productVariant = variant
        }
        if (dto.sizeId !== undefined) {
            const size = await this.sizeRepo.findOneBy({id: dto.sizeId})
            if (!size) throw new NotFoundException("Product variant size not found")
            entity.size = size
        }

        entity.qty = dto.qty ?? entity.qty
        const pricing = this.resolvePricingFromVariant(entity.productVariant as ProductVariantEntity, entity.qty)
        entity.price = pricing.price
        entity.promotion = pricing.promotion
        entity.discount = pricing.discount

        const saved = await this.repo.save(entity)
        await this.recalculateOrderTotal(entity.order.id)

        return saved
    }

    async remove(id: number) {
        const entity = await this.repo.findOne({
            where: {id},
            relations: {order: true}
        })
        if (!entity) throw new NotFoundException("Order item not found")

        await this.repo.delete(id)
        await this.recalculateOrderTotal(entity.order.id)

        return {message: "Order item has been removed"}
    }
}

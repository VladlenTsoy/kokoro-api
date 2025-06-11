import {Injectable} from "@nestjs/common"
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

    async create(dto: CreateOrderItemDto) {
        const order = await this.orderRepo.findOneBy({id: dto.orderId})
        const variant = await this.variantRepo.findOneBy({id: dto.productVariantId})
        const size = await this.sizeRepo.findOneBy({id: dto.sizeId})

        const entity = this.repo.create({
            order,
            productVariant: variant,
            size,
            qty: dto.qty,
            price: dto.price,
            promotion: dto.promotion,
            discount: dto.discount
        })

        return this.repo.save(entity)
    }

    findAll() {
        return this.repo.find({relations: ["order", "productVariant", "size"]})
    }

    findOne(id: number) {
        return this.repo.findOne({where: {id}, relations: ["order", "productVariant", "size"]})
    }

    async update(id: number, dto: UpdateOrderItemDto) {
        const entity = await this.repo.findOneBy({id})

        if (dto.orderId) {
            entity.order = await this.orderRepo.findOneBy({id: dto.orderId})
        }
        if (dto.productVariantId) {
            entity.productVariant = await this.variantRepo.findOneBy({id: dto.productVariantId})
        }
        if (dto.sizeId) {
            entity.size = await this.sizeRepo.findOneBy({id: dto.sizeId})
        }

        entity.qty = dto.qty ?? entity.qty
        entity.price = dto.price ?? entity.price
        entity.promotion = dto.promotion ?? entity.promotion
        entity.discount = dto.discount ?? entity.discount

        return this.repo.save(entity)
    }

    remove(id: number) {
        return this.repo.delete(id)
    }
}

import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn} from "typeorm"
import {OrderEntity} from "../../order/entities/order.entity"
import {ProductVariantEntity} from "../../product-variant/entities/product-variant.entity"
import {ProductVariantSizeEntity} from "../../product-variant-size/entities/product-variant-size.entity"

@Entity("order_items")
export class OrderItemEntity {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => OrderEntity, {onDelete: "CASCADE"})
    order: OrderEntity

    @ManyToOne(() => ProductVariantEntity, {nullable: false})
    productVariant: ProductVariantEntity

    @ManyToOne(() => ProductVariantSizeEntity, {nullable: false})
    size: ProductVariantSizeEntity

    @Column({type: "int"})
    qty: number

    @Column({type: "int"})
    price: number

    @Column({type: "boolean", default: false})
    promotion: boolean

    @Column({type: "int", default: 0})
    discount: number

    @CreateDateColumn()
    createdAt: Date
}

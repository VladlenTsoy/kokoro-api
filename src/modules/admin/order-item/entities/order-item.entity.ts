import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn} from "typeorm"
import {OrderEntity} from "../../order/entities/order.entity"
import {ProductVariantEntity} from "../../product-variant/entities/product-variant.entity"
import {ProductVariantSizeEntity} from "../../product-variant-size/entities/product-variant-size.entity"

@Entity("order_items")
export class OrderItemEntity {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => OrderEntity, (order) => order.items, {onDelete: "CASCADE"})
    order: OrderEntity

    @ManyToOne(() => ProductVariantEntity, {nullable: false})
    productVariant: ProductVariantEntity

    @ManyToOne(() => ProductVariantSizeEntity, {nullable: true})
    size: ProductVariantSizeEntity

    @Column({type: "int"})
    qty: number

    @Column({type: "int"})
    price: number

    @Column({type: "boolean", default: false})
    promotion: boolean

    @Column({type: "int", default: 0})
    discount: number

    @Column({type: "varchar", length: 255, nullable: true})
    productName?: string | null

    @Column({type: "varchar", length: 255, nullable: true})
    variantName?: string | null

    @Column({type: "varchar", length: 64, nullable: true})
    sku?: string | null

    @Column({type: "varchar", length: 50, nullable: true})
    colorName?: string | null

    @Column({type: "varchar", length: 50, nullable: true})
    sizeName?: string | null

    @Column({type: "varchar", length: 1024, nullable: true})
    imageUrl?: string | null

    @Column({type: "int", default: 0})
    unitPrice: number

    @Column({type: "int", default: 0})
    finalUnitPrice: number

    @Column({type: "int", default: 0})
    lineTotal: number

    @CreateDateColumn()
    createdAt: Date
}

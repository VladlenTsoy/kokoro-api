import {Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn} from "typeorm"
import {ProductVariantEntity} from "../../product-variant/entities/product-variant.entity"

@Entity("product_variant_discounts")
export class ProductVariantDiscountEntity {
    @PrimaryGeneratedColumn()
    id: number

    @OneToOne(() => ProductVariantEntity, (variant) => variant.discount, {onDelete: "CASCADE"})
    variant: ProductVariantEntity

    @Column("decimal", {precision: 5, scale: 2})
    discountPercent: number

    @Column({type: "timestamp"})
    startDate: Date

    @Column({type: "timestamp"})
    endDate: Date

    @CreateDateColumn()
    createdAt: Date
}

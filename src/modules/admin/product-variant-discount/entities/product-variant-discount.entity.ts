import {Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn} from "typeorm"
import {ProductVariantEntity} from "../../product-variant/entities/product-variant.entity"

@Entity("product_variant_discounts")
export class ProductVariantDiscountEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column("decimal", {precision: 5, scale: 2})
    discountPercent: number

    @Column({type: "timestamp", nullable: true})
    startDate?: Date | null

    @Column({type: "timestamp", nullable: true})
    endDate?: Date | null

    @CreateDateColumn()
    createdAt: Date

    @OneToOne(() => ProductVariantEntity, (variant) => variant.discount, {
        nullable: true,
        onDelete: "CASCADE"
    })
    @JoinColumn({name: "product_variant_id"})
    productVariant: ProductVariantEntity | null
}

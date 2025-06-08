import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn} from "typeorm"
import {ProductVariantEntity} from "../../product-variant/entities/product-variant.entity"

@Entity("product_variant_measurements")
export class ProductVariantMeasurementEntity {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => ProductVariantEntity, (variant) => variant.measurements, {onDelete: "CASCADE"})
    productVariant: ProductVariantEntity

    @Column("decimal", {precision: 10, scale: 2, nullable: true})
    width: number

    @Column("decimal", {precision: 10, scale: 2, nullable: true})
    height: number

    @Column("decimal", {precision: 10, scale: 2, nullable: true})
    length: number

    @Column("decimal", {precision: 10, scale: 2, nullable: true})
    weight: number

    @CreateDateColumn()
    createdAt: Date
}
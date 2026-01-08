import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm"
import {ProductVariantEntity} from "../../product-variant/entities/product-variant.entity"
import {ApiProperty} from "@nestjs/swagger"

@Entity("product_variant_measurements")
export class ProductVariantMeasurementEntity {
    @ApiProperty({
        example: 1,
        description: "The id of the product variant measurement",
        required: true
    })
    @PrimaryGeneratedColumn()
    id: number

    @ApiProperty({
        example: "Title",
        description: "The title of the product variant measurement",
        required: true
    })
    @Column({type: "varchar", length: 150})
    title: string

    @ApiProperty({
        example: "Descriptions",
        description: "The descriptions of the product variant measurement",
        required: true
    })
    @Column({type: "json"})
    descriptions: Record<number, string>[]

    @ApiProperty({
        type: () => ProductVariantEntity
    })
    @ManyToOne(() => ProductVariantEntity, (variant) => variant.measurements, {onDelete: "CASCADE"})
    productVariant: ProductVariantEntity
}

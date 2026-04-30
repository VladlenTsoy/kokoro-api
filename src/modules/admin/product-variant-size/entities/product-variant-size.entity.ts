import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm"
import {ApiProperty} from "@nestjs/swagger"
import {ProductVariantEntity} from "../../product-variant/entities/product-variant.entity"
import {SizeEntity} from "../../size/entities/size.entity"

@Entity("product_variant_sizes")
export class ProductVariantSizeEntity {
    @ApiProperty({
        example: 1,
        description: "The id of the product size",
        required: true
    })
    @PrimaryGeneratedColumn()
    id: number

    @ApiProperty({
        example: 1,
        description: "The product_variant_id of the product size",
        required: true
    })
    @Column({type: "int"})
    product_variant_id: number

    @ApiProperty({
        example: 1,
        description: "The size_id of the product size",
        required: true
    })
    @Column({type: "int"})
    size_id: number

    @ApiProperty({
        example: 10000,
        description: "The cost_price of the product size",
        required: true
    })
    @Column({type: "int"})
    cost_price: number

    @ApiProperty({
        example: 100,
        description: "The qty of the product size",
        required: true
    })
    @Column({type: "int"})
    qty: number

    @ApiProperty({
        example: 5,
        description: "Quantity reserved by active orders",
        required: true
    })
    @Column({type: "int", default: 0})
    reservedQty: number

    @ApiProperty({
        example: 20,
        description: "Quantity sold through completed orders",
        required: true
    })
    @Column({type: "int", default: 0})
    soldQty: number

    @ApiProperty({
        example: 10,
        description: "The min_qty of the product size",
        required: true
    })
    @Column({type: "int"})
    min_qty: number

    @ApiProperty({
        type: () => ProductVariantEntity
    })
    @ManyToOne(() => ProductVariantEntity, (productVariant) => productVariant.sizes)
    @JoinColumn({name: "product_variant_id"})
    productVariant: ProductVariantEntity

    @ApiProperty()
    @ManyToOne(() => SizeEntity)
    @JoinColumn({name: "size_id"})
    size: SizeEntity

    get availableQty(): number {
        return Math.max(Number(this.qty || 0) - Number(this.reservedQty || 0), 0)
    }
}

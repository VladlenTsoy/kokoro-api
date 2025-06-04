import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm"
import {ApiProperty} from "@nestjs/swagger"
import {ProductVariantEntity} from "../../product-variant/entities/product-variant.entity"

@Entity("product_variant_images")
export class ProductVariantImageEntity {
    @ApiProperty({
        example: 1,
        description: "The id of the product variant image",
        required: true
    })
    @PrimaryGeneratedColumn()
    id: number

    @ApiProperty({
        example: 1,
        description: "The product_variant_id of the product variant image",
        required: true
    })
    @Column({type: "int"})
    product_variant_id: number

    @ApiProperty({
        example: "Name",
        description: "The name of the product variant image"
    })
    @Column({type: "varchar", length: 50})
    name: string

    @ApiProperty({
        example: "Path",
        description: "The path of the product variant image"
    })
    @Column({type: "varchar"})
    path: string

    @ApiProperty({
        example: 4096,
        description: "The size of the product variant image"
    })
    @Column({type: "int"})
    size: number

    @ApiProperty({
        example: 1,
        description: "The position of the product variant image",
        required: true
    })
    @Column({type: "int"})
    position: number

    // @ApiProperty({readOnly: true})
    // @Column({select: false})
    get url(): string {
        return `https://insidebysana.sfo3.digitaloceanspaces.com/${this.path}`
    }

    @ApiProperty({
        type: () => ProductVariantEntity
    })
    @ManyToOne(() => ProductVariantEntity, (productVariant) => productVariant.images)
    @JoinColumn({name: "product_variant_id"})
    productVariant: ProductVariantEntity
}

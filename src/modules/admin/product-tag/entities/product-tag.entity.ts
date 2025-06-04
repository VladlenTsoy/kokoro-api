import {ApiProperty} from "@nestjs/swagger"
import {Column, Entity, ManyToMany, PrimaryGeneratedColumn} from "typeorm"
import {ProductVariantEntity} from "../../product-variant/entities/product-variant.entity"

@Entity("product_tags")
export class ProductTagEntity {
    @ApiProperty({
        example: 1,
        description: "The id of the product tag",
        required: true
    })
    @PrimaryGeneratedColumn()
    id: number

    @ApiProperty({
        example: "Product tag title",
        description: "The title of the product tag",
        required: true
    })
    @Column({type: "varchar", length: 20})
    title: string

    @ManyToMany(() => ProductVariantEntity, (variant) => variant.tags)
    variants: ProductVariantEntity[]
}

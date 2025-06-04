import {ApiProperty} from "@nestjs/swagger"
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    JoinTable
} from "typeorm"
import {ColorEntity} from "../../color/entities/color.entity"
import {ProductVariantSizeEntity} from "../../product-variant-size/entities/product-variant-size.entity"
import {ProductVariantImageEntity} from "../../product-variant-image/entities/product-variant-image.entity"
import {ProductEntity} from "../../product/entities/product.entity"
import {ProductTagEntity} from "../../product-tag/entities/product-tag.entity"

@Entity("product_variants")
export class ProductVariantEntity {
    @ApiProperty({
        example: 1,
        description: "The id of the product variant",
        required: true
    })
    @PrimaryGeneratedColumn()
    id: number

    @ApiProperty({
        example: "Title",
        description: "The title of the product variant",
        required: true
    })
    @Column({type: "varchar", length: 50})
    title: string

    @ApiProperty({
        example: 50000,
        description: "The price of the product variant",
        required: true
    })
    @Column({type: "int"})
    price: number

    @ApiProperty({
        example: 1,
        description: "The product_id of the product variant",
        required: true
    })
    @Column({type: "int"})
    product_id: number

    @ApiProperty({
        example: 1,
        description: "The color_id of the product variant",
        required: true
    })
    @Column({type: "int"})
    color_id: number

    @ApiProperty({
        example: "2023-12-16T11:21:52.000Z",
        description: "The created at of the product variant",
        required: true
    })
    @CreateDateColumn({type: "timestamp"})
    created_at: Date = new Date()

    @ApiProperty()
    @ManyToOne(() => ColorEntity)
    @JoinColumn({name: "color_id"})
    color: ColorEntity

    @ApiProperty()
    @ManyToOne(() => ProductEntity)
    @JoinColumn({name: "product_id"})
    product: ProductEntity

    @ApiProperty({
        type: [ProductVariantSizeEntity]
    })
    @OneToMany(() => ProductVariantSizeEntity, (size) => size.productVariant)
    sizes: ProductVariantSizeEntity[]

    @ApiProperty({
        type: [ProductVariantImageEntity]
    })
    @OneToMany(() => ProductVariantImageEntity, (image) => image.productVariant)
    images: ProductVariantImageEntity[]

    @ManyToMany(() => ProductTagEntity)
    @JoinTable({
        name: "product_tag_assignments",
        joinColumn: {
            name: "product_variant_id",
            referencedColumnName: "id"
        },
        inverseJoinColumn: {
            name: "tag_id",
            referencedColumnName: "id"
        }
    })
    tags: ProductTagEntity[]
}

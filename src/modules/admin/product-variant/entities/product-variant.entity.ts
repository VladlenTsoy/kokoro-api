import {ApiProperty} from "@nestjs/swagger"
import {Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm"
import {ColorEntity} from "../../color/entities/color.entity"
import {ProductColorSizeEntity} from "./product-color-size.entity"
import {ProductColorImageEntity} from "./product-color-image.entity"
import {ProductEntity} from "../../product/entities/product.entity"

@Entity("product_colors")
export class ProductVariantEntity {
    @ApiProperty({
        example: 1,
        description: "The id of the product color",
        required: true
    })
    @PrimaryGeneratedColumn()
    id: number

    @ApiProperty({
        example: "Title",
        description: "The title of the product color",
        required: true
    })
    @Column({type: "varchar", length: 50})
    title: string

    @ApiProperty({
        example: 50000,
        description: "The price of the product color",
        required: true
    })
    @Column({type: "int"})
    price: number

    @ApiProperty({
        example: 1,
        description: "The product_id of the product color",
        required: true
    })
    @Column({type: "int"})
    product_id: number

    @ApiProperty({
        example: 1,
        description: "The color_id of the product color",
        required: true
    })
    @Column({type: "int"})
    color_id: number

    @ApiProperty({
        example: "2023-12-16T11:21:52.000Z",
        description: "The created at of the product color",
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
        type: [ProductVariantEntity]
    })
    @OneToMany(() => ProductColorSizeEntity, (size) => size.productColor)
    sizes: ProductColorSizeEntity[]

    @ApiProperty({
        type: [ProductVariantEntity]
    })
    @OneToMany(() => ProductColorImageEntity, (image) => image.productColor)
    images: ProductColorImageEntity[]
}

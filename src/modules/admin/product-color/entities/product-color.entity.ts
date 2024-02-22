import {ApiProperty} from "@nestjs/swagger"
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    JoinColumn,
    OneToOne,
    OneToMany
} from "typeorm"
import {ColorEntity} from "../../color/entities/color.entity"
import {ProductSizeEntity} from "./product-size.entity"

@Entity("product_colors")
export class ProductColorEntity {
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

    @OneToOne(() => ColorEntity)
    @JoinColumn({name: "color_id"})
    color: ColorEntity

    @OneToMany(() => ProductSizeEntity, (size) => size.productColor)
    sizes: ProductSizeEntity[]
}

import {ApiProperty} from "@nestjs/swagger"
import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn} from "typeorm"

@Entity("product_colors")
export class ProductColor {
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
        example: "Price",
        description: "The price of the product color",
        required: true
    })
    @Column({type: "int"})
    price: number

    @ApiProperty({
        example: "Color Id",
        description: "The color_id of the product color",
        required: true
    })
    @Column({type: "int"})
    color_id: number

    @ApiProperty({
        example: "Product Id",
        description: "The product_id of the product color",
        required: true
    })
    @Column({type: "int"})
    product_id: number

    @ApiProperty({
        example: "2023-12-16T11:21:52.000Z",
        description: "The created at of the product color",
        required: true
    })
    @CreateDateColumn({type: "timestamp"})
    created_at: Date = new Date()
}

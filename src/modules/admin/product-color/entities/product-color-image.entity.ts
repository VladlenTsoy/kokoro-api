import {Column, Entity, PrimaryGeneratedColumn} from "typeorm"
import {ApiProperty} from "@nestjs/swagger"

@Entity("product_color_images")
export class ProductColorImageEntity {
    @ApiProperty({
        example: 1,
        description: "The id of the product color image",
        required: true
    })
    @PrimaryGeneratedColumn()
    id: number

    @ApiProperty({
        example: 1,
        description: "The product_color_id of the product color image",
        required: true
    })
    @Column({type: "int"})
    product_color_id: number

    @ApiProperty({
        example: "Name",
        description: "The name of the product color image"
    })
    @Column({type: "varchar", length: 50})
    name: string

    @ApiProperty({
        example: "Path",
        description: "The path of the product color image"
    })
    @Column({type: "varchar"})
    path: string

    @ApiProperty({
        example: 4096,
        description: "The size of the product color image"
    })
    @Column({type: "int"})
    size: number

    @ApiProperty({
        example: 1,
        description: "The position of the product color image",
        required: true
    })
    @Column({type: "int"})
    position: number
}

import {ApiProperty} from "@nestjs/swagger"
import {Column, Entity, PrimaryGeneratedColumn} from "typeorm"

@Entity("product_color_tags")
export class ProductTagEntity {
    @ApiProperty({
        example: 1,
        description: "The id of the product color tag",
        required: true
    })
    @PrimaryGeneratedColumn()
    id: number

    @ApiProperty({
        example: "Product color tag title",
        description: "The title of the product color tag",
        required: true
    })
    @Column({type: "varchar", length: 20})
    title: string
}

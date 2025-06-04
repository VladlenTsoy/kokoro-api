import {ApiProperty} from "@nestjs/swagger"
import {Column, Entity, PrimaryGeneratedColumn} from "typeorm"

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
}

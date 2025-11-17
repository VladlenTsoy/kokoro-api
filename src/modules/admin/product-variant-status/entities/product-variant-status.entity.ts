import {Entity, PrimaryGeneratedColumn, Column} from "typeorm"
import {ApiProperty} from "@nestjs/swagger"

@Entity("product_variant_statuses")
export class ProductVariantStatusEntity {
    @ApiProperty({
        example: 1,
        description: "The id of the product variant status",
        required: true
    })
    @PrimaryGeneratedColumn()
    id: number

    @ApiProperty({
        example: "Draft",
        description: "The title of the product variant status",
        required: true
    })
    @Column({type: "varchar", length: 50})
    title: string

    @ApiProperty({
        example: 1,
        description: "The position of the product variant status",
        required: false
    })
    @Column({type: "int"})
    position: number

    @ApiProperty({
        example: true,
        description: "The position of the product variant status",
        required: false
    })
    @Column({type: "boolean", default: false})
    is_default: boolean
}

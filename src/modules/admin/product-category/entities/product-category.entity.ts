import {ApiProperty} from "@nestjs/swagger"
import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn} from "typeorm"

@Entity("product_categories")
export class ProductCategoryEntity {
    @ApiProperty({
        example: 1,
        description: "The id of the product category",
        required: true
    })
    @PrimaryGeneratedColumn()
    id: number

    @ApiProperty({
        example: "Product category title",
        description: "The title of the product category",
        required: true
    })
    @Column({type: "varchar", length: 255})
    title: string

    @ApiProperty({
        example: 1,
        description: "The parent_category_id of the product category",
        default: null
    })
    @Column({type: "varchar", length: 20, nullable: true})
    parent_category_id: number | null

    @ApiProperty({
        example: "/t-shirt",
        description: "The url of the product category",
        required: true
    })
    @Column({type: "varchar", length: 255})
    url: string

    @ApiProperty({
        example: null,
        description: "The is_hide of the product category",
        default: null
    })
    @Column({type: "boolean", nullable: true, default: null})
    is_hide: boolean | null

    @ApiProperty({
        example: "2023-12-16T11:21:52.000Z",
        description: "The created at of the product category",
        required: true
    })
    @CreateDateColumn({type: "timestamp"})
    created_at: Date = new Date()
}

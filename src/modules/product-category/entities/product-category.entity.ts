import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn} from "typeorm"
import {transliteration} from "../../../utils/transliteration"
import {ApiProperty} from "@nestjs/swagger"

@Entity("product_categories")
export class ProductCategoryEntity {
    @ApiProperty({example: 1, description: "The id of the product category", required: true})
    @PrimaryGeneratedColumn()
    id: number

    @ApiProperty({example: "Product category title", description: "The title of the product category", required: true})
    @Column()
    title: string

    @ApiProperty({example: 1, description: "The parent category id of the product category", required: false})
    @Column({nullable: true, default: null})
    parent_category_id: number

    @ApiProperty({example: "product_category_title", description: "The url of the product category", required: true})
    public get url() {
        return transliteration(this.title).toLowerCase().trim().replaceAll(" ", "-")
    }

    @ApiProperty({example: true, description: "The hide of the product category", required: false, default: null})
    @Column({nullable: true, default: null})
    is_hide: boolean

    @ApiProperty({
        example: "2023-12-16T11:21:52.000Z",
        description: "The created at of the product category",
        required: true
    })
    @CreateDateColumn({type: "timestamp"})
    created_at: Date = new Date()

    // Overriding toJSON to include virtual properties
    toJSON(): any {
        return {...this, url: this.url}
    }
}

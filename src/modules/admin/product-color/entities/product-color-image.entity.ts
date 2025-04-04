import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm"
import {ApiProperty} from "@nestjs/swagger"
import {ProductColorEntity} from "./product-color.entity"

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

    // @ApiProperty({readOnly: true})
    // @Column({select: false})
    get url(): string {
        return `https://insidebysana.sfo3.digitaloceanspaces.com/${this.path}`
    }

    @ApiProperty({
        type: ProductColorEntity
    })
    @ManyToOne(() => ProductColorEntity, (productColor) => productColor.images)
    @JoinColumn({name: "product_color_id"})
    productColor: ProductColorEntity
}

import {ApiHideProperty, ApiProperty} from "@nestjs/swagger"
import {Column, Entity, ManyToMany, PrimaryGeneratedColumn} from "typeorm"
import {ProductEntity} from "../../product/entities/product.entity"

@Entity("product_properties")
export class ProductPropertyEntity {
    @ApiProperty({
        example: 1,
        description: "The id of the product property",
        required: true
    })
    @PrimaryGeneratedColumn()
    id: number

    @ApiProperty({
        example: "Title",
        description: "The title of the product property",
        required: true
    })
    @Column({type: "varchar", length: 200})
    title: string

    @ApiProperty({
        example: "Description",
        description: "The description of the product property",
        required: true
    })
    @Column({type: "text"})
    description: string

    @ApiProperty({
        example: false,
        description: "The is_global of the product property",
        default: false
    })
    @Column({type: "boolean", default: false})
    is_global: boolean

    @ApiHideProperty()
    @ManyToMany(() => ProductEntity, (product) => product.properties)
    products: ProductEntity[]
}

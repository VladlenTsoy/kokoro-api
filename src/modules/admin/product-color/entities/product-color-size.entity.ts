import {Column, Entity, JoinColumn, PrimaryGeneratedColumn, ManyToOne, OneToOne} from "typeorm"
import {ApiProperty} from "@nestjs/swagger"
import {ProductColorEntity} from "./product-color.entity"
import {SizeEntity} from "../../size/entities/size.entity"

@Entity("product_color_sizes")
export class ProductColorSizeEntity {
    @ApiProperty({
        example: 1,
        description: "The id of the product size",
        required: true
    })
    @PrimaryGeneratedColumn()
    id: number

    @ApiProperty({
        example: 1,
        description: "The product_color_id of the product size",
        required: true
    })
    @Column({type: "int"})
    product_color_id: number

    @ApiProperty({
        example: 1,
        description: "The size_id of the product size",
        required: true
    })
    @Column({type: "int"})
    size_id: number

    @ApiProperty({
        example: 10000,
        description: "The cost_price of the product size",
        required: true
    })
    @Column({type: "int"})
    cost_price: number

    @ApiProperty({
        example: 100,
        description: "The qty of the product size",
        required: true
    })
    @Column({type: "int"})
    qty: number

    @ApiProperty({
        example: 10,
        description: "The min_qty of the product size",
        required: true
    })
    @Column({type: "int"})
    min_qty: number

    @ApiProperty({
        type: ProductColorEntity
    })
    @ManyToOne(() => ProductColorEntity, (productColor) => productColor.sizes)
    @JoinColumn({name: "product_color_id"})
    productColor: ProductColorEntity

    @ApiProperty()
    @OneToOne(() => SizeEntity)
    @JoinColumn({name: "size_id"})
    size: SizeEntity
}

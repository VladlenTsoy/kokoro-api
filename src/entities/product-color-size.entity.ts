import {Entity, Column, PrimaryGeneratedColumn} from "typeorm"

@Entity("product-color-sizes")
export class ProductColorSizeEntity {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    product_color_id: number

    @Column()
    size_id: string

    @Column()
    cost_price: number
}

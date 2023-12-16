import {Entity, Column, PrimaryGeneratedColumn} from "typeorm"

@Entity("product_color_sizes")
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

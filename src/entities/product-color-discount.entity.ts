import {Entity, Column, PrimaryGeneratedColumn} from "typeorm"

@Entity("product_color_discounts")
export class ProductColorDiscountEntity {

    @PrimaryGeneratedColumn()
    id: number

    @Column({type: "float"})
    discount: number

    @Column()
    product_color_id: number

    @Column({type: "datetime"})
    end_at: string

    @Column({type: "timestamp"})
    created_at: Date = new Date()
}

import {Entity, Column, PrimaryGeneratedColumn} from "typeorm"

@Entity("product-color-measurements")
export class ProductColorMeasurementEntity {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: number

    @Column({type: "jsonb"})
    description: object

    @Column()
    product_color_id: number
}

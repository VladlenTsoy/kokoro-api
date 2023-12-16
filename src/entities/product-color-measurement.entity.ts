import {Entity, Column, PrimaryGeneratedColumn} from "typeorm"

@Entity("product_color_measurements")
export class ProductColorMeasurementEntity {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: number

    @Column({type: "json"})
    description: object

    @Column()
    product_color_id: number
}

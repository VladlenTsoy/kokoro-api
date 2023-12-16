import {Entity, Column, PrimaryGeneratedColumn} from "typeorm"

@Entity("product_color_tags")
export class ProductColorTagEntity {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string
}

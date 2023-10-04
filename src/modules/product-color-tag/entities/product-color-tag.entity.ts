import {Entity, Column, PrimaryGeneratedColumn} from "typeorm"

@Entity("product-color-tags")
export class ProductColorTagEntity {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string
}

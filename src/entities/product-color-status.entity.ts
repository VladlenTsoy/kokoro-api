import {Entity, Column, PrimaryGeneratedColumn} from "typeorm"

@Entity("product_color_statuses")
export class ProductColorStatusEntity {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string

    @Column()
    position: number

    @Column({default: false})
    is_default: boolean
}

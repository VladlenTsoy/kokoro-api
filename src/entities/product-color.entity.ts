import {Entity, Column, PrimaryGeneratedColumn} from "typeorm"

@Entity("product_colors")
export class ProductColorEntity {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string

    @Column()
    price: number

    @Column()
    product_id: number

    @Column()
    color_id: number

    @Column()
    status_id: number

    @Column({nullable: true, default: null})
    is_new: boolean

    @Column({nullable: true, default: null})
    is_hide: boolean

    @Column({type: "timestamp"})
    created_at: Date = new Date()
}

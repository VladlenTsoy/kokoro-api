import {Entity, Column, PrimaryGeneratedColumn} from "typeorm"

@Entity("products")
export class ProductEntity {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    category_id: number

    @Column({type: "timestamp"})
    created_at: Date = new Date()
}

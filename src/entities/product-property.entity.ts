import {Entity, Column, PrimaryGeneratedColumn} from "typeorm"

@Entity("product_properties")
export class ProductPropertyEntity {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string

    @Column()
    description: string

    @Column({default: false})
    is_global: boolean
}

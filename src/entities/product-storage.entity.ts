import {Entity, Column, PrimaryGeneratedColumn} from "typeorm"

@Entity("product_storages")
export class ProductStorageEntity {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string
}

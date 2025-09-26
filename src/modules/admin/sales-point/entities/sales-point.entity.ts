import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany} from "typeorm"
import {ProductStorageEntity} from "../../product-storage/entities/product-storage.entity"

@Entity("sales_points")
export class SalesPointEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string

    @Column({type: "json", nullable: true})
    location: any

    @CreateDateColumn()
    createdAt: Date

    @OneToMany(() => ProductStorageEntity, (storage) => storage.salesPoint)
    product_storages: ProductStorageEntity[]
}

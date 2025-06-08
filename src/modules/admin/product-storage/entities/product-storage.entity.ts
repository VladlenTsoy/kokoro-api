import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn} from "typeorm"
import {SalesPointEntity} from "../../sales-point/entities/sales-point.entity"

@Entity("product_storages")
export class ProductStorageEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string

    @ManyToOne(() => SalesPointEntity, {onDelete: "CASCADE"})
    salesPoint: SalesPointEntity

    @CreateDateColumn()
    createdAt: Date
}

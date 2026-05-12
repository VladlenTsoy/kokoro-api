import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm"
import {SalesPointEntity} from "../../sales-point/entities/sales-point.entity"

@Entity("pos_devices")
export class PosDeviceEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({type: "varchar", length: 120})
    title: string

    @ManyToOne(() => SalesPointEntity, {nullable: true, onDelete: "SET NULL"})
    salesPoint?: SalesPointEntity | null

    @Column({type: "varchar", length: 120, unique: true, nullable: true})
    deviceCode?: string | null

    @Column({type: "boolean", default: true})
    isActive: boolean

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}

import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn} from "typeorm"

@Entity("order_statuses")
export class OrderStatusEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({type: "varchar", length: 255})
    title: string

    @Column({type: "enum", enum: ["admin", "manager"], default: "admin"})
    access: "admin" | "manager"

    @Column({type: "boolean", default: false})
    fixed: boolean

    @Column({type: "int", default: 0})
    position: number

    @CreateDateColumn()
    createdAt: Date
}

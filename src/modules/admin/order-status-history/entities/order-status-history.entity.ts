import {Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn} from "typeorm"
import {OrderEntity} from "../../order/entities/order.entity"
import {OrderStatusEntity} from "../../order-status/entities/order-status.entity"

@Entity("order_status_histories")
export class OrderStatusHistoryEntity {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => OrderEntity, {onDelete: "CASCADE"})
    order: OrderEntity

    @ManyToOne(() => OrderStatusEntity)
    fromStatus: OrderStatusEntity

    @ManyToOne(() => OrderStatusEntity)
    toStatus: OrderStatusEntity

    @Column({type: "varchar", length: 255, nullable: true})
    changedBy?: string

    @CreateDateColumn()
    changedAt: Date
}

import {Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique} from "typeorm"
import {OrderStatusEntity} from "./order-status.entity"

@Entity("order_status_transitions")
@Unique("UQ_order_status_transition", ["fromStatus", "toStatus"])
export class OrderStatusTransitionEntity {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => OrderStatusEntity, {onDelete: "CASCADE"})
    @JoinColumn({name: "fromStatusId"})
    fromStatus: OrderStatusEntity

    @ManyToOne(() => OrderStatusEntity, {onDelete: "CASCADE"})
    @JoinColumn({name: "toStatusId"})
    toStatus: OrderStatusEntity

    @Column({type: "boolean", default: true})
    isActive: boolean

    @CreateDateColumn()
    createdAt: Date
}

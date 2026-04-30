import {Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn, JoinColumn} from "typeorm"
import {OrderEntity} from "../../order/entities/order.entity"
import {OrderStatusEntity} from "../../order-status/entities/order-status.entity"
import {EmployeeEntity} from "../../employee/entities/employee.entity"

@Entity("order_status_histories")
export class OrderStatusHistoryEntity {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => OrderEntity, (order) => order.histories, {onDelete: "CASCADE"})
    @JoinColumn({name: "orderId"})
    order: OrderEntity

    @ManyToOne(() => OrderStatusEntity, {nullable: true})
    fromStatus?: OrderStatusEntity | null

    @ManyToOne(() => OrderStatusEntity)
    toStatus: OrderStatusEntity

    @ManyToOne(() => EmployeeEntity, {nullable: true, onDelete: "SET NULL"})
    employee?: EmployeeEntity | null

    @Column({type: "varchar", length: 255, nullable: true})
    changedBy?: string

    @Column({type: "varchar", length: 255, nullable: true})
    comment?: string | null

    @Column({type: "boolean", default: true})
    visibleForClient: boolean

    @CreateDateColumn()
    changedAt: Date
}

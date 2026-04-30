import {Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm"
import {OrderEntity} from "./order.entity"
import {EmployeeEntity} from "../../employee/entities/employee.entity"

@Entity("order_comments")
export class OrderCommentEntity {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => OrderEntity, (order) => order.comments, {onDelete: "CASCADE"})
    @JoinColumn({name: "orderId"})
    order: OrderEntity

    @ManyToOne(() => EmployeeEntity, {nullable: true, onDelete: "SET NULL"})
    @JoinColumn({name: "employeeId"})
    employee?: EmployeeEntity | null

    @Column({type: "text"})
    message: string

    @Column({type: "boolean", default: false})
    visibleForClient: boolean

    @CreateDateColumn()
    createdAt: Date
}

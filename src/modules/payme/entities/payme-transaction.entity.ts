import {Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm"
import {OrderEntity} from "../../admin/order/entities/order.entity"

export enum PaymeTransactionState {
    CREATED = 1,
    PERFORMED = 2,
    CANCELLED = -1,
    CANCELLED_AFTER_PERFORM = -2
}

@Entity("payme_transactions")
export class PaymeTransactionEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Index("IDX_payme_transactions_payme_id")
    @Column({type: "varchar", length: 64, unique: true})
    paymeId: string

    @ManyToOne(() => OrderEntity, {nullable: false, onDelete: "CASCADE"})
    @JoinColumn({name: "orderId"})
    order: OrderEntity

    @Column({type: "int"})
    amount: number

    @Column({type: "int"})
    state: PaymeTransactionState

    @Column({type: "bigint"})
    createTime: number

    @Column({type: "bigint", default: 0})
    performTime: number

    @Column({type: "bigint", default: 0})
    cancelTime: number

    @Column({type: "int", nullable: true})
    reason?: number | null

    @CreateDateColumn()
    createdAt: Date
}

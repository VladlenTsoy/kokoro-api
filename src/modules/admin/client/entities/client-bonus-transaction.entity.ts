import {Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm"
import {ClientEntity} from "./client.entity"
import {OrderEntity} from "../../order/entities/order.entity"

export enum ClientBonusTransactionType {
    EARN = "earn",
    SPEND = "spend",
    REFUND = "refund",
    ADJUST = "adjust"
}

@Entity("client_bonus_transactions")
export class ClientBonusTransactionEntity {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => ClientEntity, {onDelete: "CASCADE"})
    @JoinColumn({name: "clientId"})
    client: ClientEntity

    @ManyToOne(() => OrderEntity, {nullable: true, onDelete: "SET NULL"})
    @JoinColumn({name: "orderId"})
    order?: OrderEntity | null

    @Column({type: "enum", enum: ClientBonusTransactionType})
    type: ClientBonusTransactionType

    @Column({type: "int"})
    amount: number

    @Column({type: "varchar", length: 255, nullable: true})
    comment?: string | null

    @CreateDateColumn()
    createdAt: Date
}

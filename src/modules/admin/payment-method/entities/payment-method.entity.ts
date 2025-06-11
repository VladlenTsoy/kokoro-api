import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn} from "typeorm"

@Entity("payment_methods")
export class PaymentMethodEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({type: "varchar", length: 255})
    title: string

    @Column({type: "varchar", length: 50})
    code: string

    @Column({type: "boolean", default: true})
    isActive: boolean

    @Column({type: "boolean", default: false})
    isCash: boolean

    @Column({type: "boolean", default: false})
    isCard: boolean

    @Column({type: "boolean", default: false})
    isOnline: boolean

    @CreateDateColumn()
    createdAt: Date
}

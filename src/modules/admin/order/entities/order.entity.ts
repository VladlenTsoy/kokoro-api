import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne} from "typeorm"
import {OrderStatusEntity} from "../../order-status/entities/order-status.entity"
import {PaymentMethodEntity} from "../../payment-method/entities/payment-method.entity"
import {SourceEntity} from "../../source/entities/source.entity"
import {DeliveryTypeEntity} from "../../delivery-type/entities/delivery-type.entity"

@Entity("orders")
export class OrderEntity {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => OrderStatusEntity, {nullable: false})
    status: OrderStatusEntity

    @ManyToOne(() => PaymentMethodEntity, {nullable: true})
    paymentMethod?: PaymentMethodEntity

    @ManyToOne(() => SourceEntity, {nullable: true})
    source?: SourceEntity

    @ManyToOne(() => DeliveryTypeEntity, {nullable: true})
    deliveryType?: DeliveryTypeEntity

    @Column({type: "int", default: 0})
    total: number

    @Column({type: "varchar", length: 50, nullable: true})
    phone?: string

    @Column({type: "varchar", length: 255, nullable: true})
    clientName?: string

    @Column({type: "varchar", length: 255, nullable: true})
    comment?: string

    @CreateDateColumn()
    createdAt: Date
}

import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany} from "typeorm"
import {OrderStatusEntity} from "../../order-status/entities/order-status.entity"
import {PaymentMethodEntity} from "../../payment-method/entities/payment-method.entity"
import {SourceEntity} from "../../source/entities/source.entity"
import {DeliveryTypeEntity} from "../../delivery-type/entities/delivery-type.entity"
import {ClientEntity} from "../../client/entities/client.entity"
import {ClientAddressEntity} from "../../client-address/entities/client-address.entity"
import {OrderItemEntity} from "../../order-item/entities/order-item.entity"

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

    @ManyToOne(() => ClientEntity, (client) => client.orders, {nullable: true, onDelete: "SET NULL"})
    client?: ClientEntity

    @ManyToOne(() => ClientAddressEntity, (address) => address.orders, {nullable: true, onDelete: "SET NULL"})
    clientAddress?: ClientAddressEntity

    @Column({type: "int", default: 0})
    total: number

    @Column({type: "varchar", length: 50, nullable: true})
    phone?: string

    @Column({type: "varchar", length: 255, nullable: true})
    clientName?: string

    @Column({type: "varchar", length: 255, nullable: true})
    comment?: string

    @OneToMany(() => OrderItemEntity, (item) => item.order)
    items: OrderItemEntity[]

    @CreateDateColumn()
    createdAt: Date
}

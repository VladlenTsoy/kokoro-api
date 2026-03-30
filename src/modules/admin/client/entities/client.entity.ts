import {Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm"
import {OrderEntity} from "../../order/entities/order.entity"
import {ClientAddressEntity} from "../../client-address/entities/client-address.entity"

@Entity("clients")
export class ClientEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({type: "varchar", length: 255})
    name: string

    @Column({type: "varchar", length: 50, unique: true})
    phone: string

    @OneToMany(() => ClientAddressEntity, (address) => address.client)
    addresses: ClientAddressEntity[]

    @OneToMany(() => OrderEntity, (order) => order.client)
    orders: OrderEntity[]

    @CreateDateColumn()
    createdAt: Date
}

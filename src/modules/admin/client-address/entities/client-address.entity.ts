import {Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm"
import {ClientEntity} from "../../client/entities/client.entity"
import {OrderEntity} from "../../order/entities/order.entity"

@Entity("client_addresses")
export class ClientAddressEntity {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => ClientEntity, (client) => client.addresses, {onDelete: "CASCADE"})
    @JoinColumn({name: "clientId"})
    client: ClientEntity

    @Column({type: "varchar", length: 255})
    address: string

    @Column({type: "json", nullable: true})
    location?: any

    @Column({type: "varchar", length: 255})
    locationHash: string

    @OneToMany(() => OrderEntity, (order) => order.clientAddress)
    orders: OrderEntity[]

    @CreateDateColumn()
    createdAt: Date
}

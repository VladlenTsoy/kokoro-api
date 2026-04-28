import {Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm"
import {OrderEntity} from "../../order/entities/order.entity"
import {ClientAddressEntity} from "../../client-address/entities/client-address.entity"
import {ClientRefreshTokenEntity} from "../../../client/auth/entities/client-refresh-token.entity"

@Entity("clients")
export class ClientEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({type: "varchar", length: 255})
    name: string

    @Column({type: "varchar", length: 50, unique: true, nullable: true})
    phone?: string | null

    @Column({type: "datetime", nullable: true})
    lastLoginAt?: Date | null

    @Column({type: "tinyint", default: true})
    isActive: boolean

    @OneToMany(() => ClientAddressEntity, (address) => address.client)
    addresses: ClientAddressEntity[]

    @OneToMany(() => OrderEntity, (order) => order.client)
    orders: OrderEntity[]

    @OneToMany(() => ClientRefreshTokenEntity, (token) => token.client)
    refreshTokens: ClientRefreshTokenEntity[]

    @CreateDateColumn()
    createdAt: Date
}

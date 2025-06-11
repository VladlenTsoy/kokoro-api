import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne} from "typeorm"
import {OrderEntity} from "../../order/entities/order.entity"
import {CityEntity} from "../../city/entities/city.entity"
import {CountryEntity} from "../../country/entities/country.entity"

@Entity("order_addresses")
export class OrderAddressEntity {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => OrderEntity, {onDelete: "CASCADE"})
    order: OrderEntity

    @ManyToOne(() => CountryEntity, {nullable: true})
    country?: CountryEntity

    @ManyToOne(() => CityEntity, {nullable: true})
    city?: CityEntity

    @Column({type: "varchar", length: 255})
    address: string

    @Column({type: "varchar", length: 255, nullable: true})
    comment?: string

    @Column({type: "varchar", length: 50, nullable: true})
    entrance?: string

    @Column({type: "varchar", length: 50, nullable: true})
    floor?: string

    @Column({type: "varchar", length: 50, nullable: true})
    intercom?: string

    @Column({type: "json", nullable: true})
    position?: any

    @CreateDateColumn()
    createdAt: Date
}

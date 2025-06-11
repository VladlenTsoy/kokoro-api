import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne} from "typeorm"
import {CityEntity} from "../../city/entities/city.entity"

export enum DeliveryTypeEnum {
    PICKUP = "pickup",
    COURIER = "courier",
    THIRD_PARTY = "third_party",
    PARTNER = "partner"
}

@Entity("delivery_types")
export class DeliveryTypeEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({type: "varchar", length: 255})
    title: string

    @Column({type: "enum", enum: DeliveryTypeEnum})
    type: DeliveryTypeEnum

    @Column({type: "int", default: 0})
    price: number

    @Column({type: "varchar", length: 255, nullable: true})
    description?: string

    @ManyToOne(() => CityEntity, {nullable: true})
    city?: CityEntity

    @CreateDateColumn()
    createdAt: Date
}

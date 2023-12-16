import {Entity, Column, PrimaryGeneratedColumn} from "typeorm"

@Entity("client_addresses")
export class ClientAddressEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string

    @Column()
    full_name: string

    @Column()
    phone: string

    @Column({nullable: true})
    country: string

    @Column({nullable: true})
    city: string

    @Column({nullable: true})
    address: string

    @Column({nullable: true, type: "json"})
    position: string

    @Column()
    client_id: number

    @Column({type: "timestamp"})
    created_at: Date = new Date()
}

import {Column, Entity, PrimaryGeneratedColumn} from "typeorm"

@Entity("clients")
export class ClientEntity {

    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable: true})
    phone?: string | null

    @Column()
    full_name: string

    @Column({nullable: true, unique: true})
    email?: string | null

    @Column({nullable: true})
    password?: string | null

    @Column()
    source_id: number

    @Column({type: "timestamp"})
    created_at: Date = new Date()
}

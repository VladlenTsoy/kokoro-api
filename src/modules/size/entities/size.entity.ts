import {Entity, Column, PrimaryGeneratedColumn} from "typeorm"

@Entity("sizes")
export class SizeEntity {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string

    @Column({nullable: true, default: null})
    is_hide: boolean
}

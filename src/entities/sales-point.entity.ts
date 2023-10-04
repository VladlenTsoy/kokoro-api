import {Entity, Column, PrimaryGeneratedColumn} from "typeorm"

@Entity("sales-points")
export class SalesPointEntity {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string

    @Column({type: "jsonb", nullable: true, default: null})
    location: object
}

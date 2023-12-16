import {Entity, Column, PrimaryGeneratedColumn} from "typeorm"

@Entity("sales_points")
export class SalesPointEntity {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string

    @Column({type: "json", nullable: true, default: null})
    location: object
}

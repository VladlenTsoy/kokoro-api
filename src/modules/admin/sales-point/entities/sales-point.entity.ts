import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn} from "typeorm"

@Entity("sales_points")
export class SalesPointEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string

    @Column({type: "json", nullable: true})
    location: any

    @CreateDateColumn()
    createdAt: Date
}

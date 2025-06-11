import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn} from "typeorm"

@Entity("countries")
export class CountryEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({type: "varchar", length: 255})
    name: string

    @Column({type: "varchar", length: 255, nullable: true})
    flag?: string

    @Column({type: "json", nullable: true})
    position?: any

    @CreateDateColumn()
    createdAt: Date
}

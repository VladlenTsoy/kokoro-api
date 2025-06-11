import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn} from "typeorm"

@Entity("sources")
export class SourceEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({type: "varchar", length: 255})
    title: string

    @Column({type: "varchar", length: 50, nullable: true})
    code: string

    @Column({type: "boolean", default: true})
    isActive: boolean

    @CreateDateColumn()
    createdAt: Date
}

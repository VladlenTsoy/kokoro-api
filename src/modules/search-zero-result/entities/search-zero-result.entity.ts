import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm"

@Entity("search_zero_results")
export class SearchZeroResultEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({type: "varchar", length: 160, unique: true})
    query: string

    @Column({type: "int", default: 1})
    count: number

    @Column({type: "datetime"})
    lastSearchedAt: Date

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}

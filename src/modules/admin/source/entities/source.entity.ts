import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn} from "typeorm"
import {ApiProperty} from "@nestjs/swagger"

@Entity("sources")
export class SourceEntity {
    @ApiProperty({
        example: 1,
        description: "The id of the source",
        required: true
    })
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

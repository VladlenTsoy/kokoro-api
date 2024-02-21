import {Entity, Column, PrimaryGeneratedColumn} from "typeorm"
import {ApiProperty} from "@nestjs/swagger"

@Entity("colors")
export class ColorEntity {
    @ApiProperty({
        example: 1,
        description: "The id of the color",
        required: true
    })
    @PrimaryGeneratedColumn()
    id: number

    @ApiProperty({
        example: "Color title",
        description: "The title of the color",
        required: true
    })
    @Column({type: "varchar", length: 20})
    title: string

    @ApiProperty({
        example: "#FFFFFF",
        description: "The hex of the color",
        required: true
    })
    @Column({type: "varchar", length: 8})
    hex: string

    @ApiProperty({
        example: "2024-02-20T14:30:00Z",
        description:
            "The timestamp indicating when the record was marked as deleted",
        required: false,
        default: null
    })
    @Column({type: "timestamp", nullable: true, default: null})
    deleted_at: Date
}

import {Entity, Column, PrimaryGeneratedColumn} from "typeorm"
import {ApiProperty} from "@nestjs/swagger"

@Entity("sizes")
export class SizeEntity {
    @ApiProperty({example: 1, description: "The id of the size", required: true})
    @PrimaryGeneratedColumn()
    id: number

    @ApiProperty({example: "Size title", description: "The title of the size", required: true})
    @Column()
    title: string

    @ApiProperty({example: true, description: "The hide of the product category", required: false, default: null})
    @Column({nullable: true, default: null})
    is_hide: boolean
}

import {Entity, Column, PrimaryGeneratedColumn} from "typeorm"
import {ApiProperty} from "@nestjs/swagger"

@Entity("colors")
export class ColorEntity {
    @ApiProperty({example: 1, description: "The id of the color", required: true})
    @PrimaryGeneratedColumn()
    id: number

    @ApiProperty({example: "Color title", description: "The title of the color", required: true})
    @Column()
    title: string

    @ApiProperty({example: "#FFFFFF", description: "The hex of the color", required: true})
    @Column()
    hex: string

    @ApiProperty({example: true, description: "The hide of the product category", required: false})
    @Column({nullable: true, default: null})
    is_hide: boolean
}

import {Entity, PrimaryGeneratedColumn, CreateDateColumn} from "typeorm"
import {ApiProperty} from "@nestjs/swagger"

@Entity("products")
export class Product {
    @ApiProperty({
        example: 1,
        description: "The id of the product",
        required: true
    })
    @PrimaryGeneratedColumn()
    id: number

    @ApiProperty({
        example: "2023-12-16T11:21:52.000Z",
        description: "The created at of the product",
        required: true
    })
    @CreateDateColumn({type: "timestamp"})
    created_at: Date = new Date()
}

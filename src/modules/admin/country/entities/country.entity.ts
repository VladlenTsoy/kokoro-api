import {Column, Entity, PrimaryGeneratedColumn} from "typeorm"
import {ApiProperty} from "@nestjs/swagger"

@Entity("countries")
export class CountryEntity {
    @ApiProperty({
        example: 1,
        description: "The id of the country",
        required: true
    })
    @PrimaryGeneratedColumn()
    id: number

    @ApiProperty({
        example: "Uzbekistan",
        description: "The name of the country",
        required: true
    })
    @Column({type: "varchar", length: 255})
    name: string

    @ApiProperty({
        example: "/link-to-flag",
        description: "The flag of the country",
        required: false,
        nullable: true
    })
    @Column({type: "varchar", length: 255, nullable: true})
    flag?: string

    @ApiProperty({
        example: {lat: 41.311081, lng: 69.240562},
        description: "The flag of the country",
        required: false,
        nullable: true
    })
    @Column({type: "json", nullable: true})
    position?: {lat: number; lng: number}
}

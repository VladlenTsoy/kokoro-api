import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne} from "typeorm"
import {CountryEntity} from "../../country/entities/country.entity"
import {ApiProperty} from "@nestjs/swagger"

@Entity("cities")
export class CityEntity {
    @ApiProperty({
        example: 1,
        description: "The id of the city",
        required: true
    })
    @PrimaryGeneratedColumn()
    id: number

    @ApiProperty({
        example: "Tashkent",
        description: "The name of the city",
        required: true
    })
    @Column({type: "varchar", length: 255})
    name: string

    @ManyToOne(() => CountryEntity, {onDelete: "CASCADE"})
    country: CountryEntity

    @ApiProperty({
        example: {lat: 41.311081, lng: 69.240562},
        description: "The location of the city",
        required: false,
        nullable: true
    })
    @Column({type: "json", nullable: true})
    position?: {lat: number; lng: number}

    @CreateDateColumn()
    createdAt: Date
}

import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne} from "typeorm"
import {CountryEntity} from "../../country/entities/country.entity"

@Entity("cities")
export class CityEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({type: "varchar", length: 255})
    name: string

    @ManyToOne(() => CountryEntity, {onDelete: "CASCADE"})
    country: CountryEntity

    @Column({type: "json", nullable: true})
    position?: any

    @CreateDateColumn()
    createdAt: Date
}

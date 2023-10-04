import {Entity, Column, PrimaryGeneratedColumn} from "typeorm"

@Entity("colors")
export class ColorEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string

    @Column()
    hex: string

    @Column({nullable: true, default: null})
    is_hide: boolean
}

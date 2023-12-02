import {Entity, Column, PrimaryGeneratedColumn} from "typeorm"
import {transliteration} from "../../../utils/translit"

@Entity("categories")
export class ProductCategoryEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string

    @Column({nullable: true, default: null})
    parent_category_id: number

    public get url() {
        return transliteration(this.title).toLowerCase().trim().replaceAll(" ", "-")
    }

    @Column({nullable: true, default: null})
    is_hide: boolean

    @Column({type: "timestamp"})
    created_at: Date = new Date()
}

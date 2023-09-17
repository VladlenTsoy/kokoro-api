import {Entity, PrimaryKey, Property} from "@mikro-orm/core"
import {transliteration} from "../utils/translit"

@Entity({tableName: "categories"})
export class CategoryEntity {
    @PrimaryKey()
    id: number

    @Property()
    title: string

    @Property({nullable: true, default: null})
    category_id: number

    @Property({persist: true})
    get url() {
        return transliteration(this.title).toLowerCase().trim().replaceAll(" ", "-")
    }

    @Property({nullable: true, default: null})
    is_hide: boolean

    @Property({type: "timestamp"})
    created_at: Date = new Date()

    constructor(title, category_id, is_hide?: null) {
        this.title = title
        this.category_id = category_id
        this.is_hide = is_hide
    }
}

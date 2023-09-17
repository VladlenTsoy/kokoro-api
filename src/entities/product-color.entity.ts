import {Entity, PrimaryKey, Property} from "@mikro-orm/core"

@Entity({tableName: "products"})
export class ProductEntity {

    @PrimaryKey()
    id: number

    @Property({nullable: true})
    category_id: number

    @Property({type: "datetime"})
    created_at!: string

    constructor(category_id) {
        this.category_id = category_id
    }
}

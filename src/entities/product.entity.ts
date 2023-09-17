import {Entity, PrimaryKey, Property} from "@mikro-orm/core"

@Entity({tableName: "products"})
export class ProductEntity {

    @PrimaryKey()
    id: number

    @Property()
    category_id: number

    @Property({type: "timestamp"})
    created_at: Date = new Date()

    constructor(category_id) {
        this.category_id = category_id
    }
}

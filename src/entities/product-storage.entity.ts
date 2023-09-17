import {Entity, PrimaryKey, Property} from "@mikro-orm/core"

@Entity({tableName: "product_storages"})
export class ProductStoragesEntity {

    @PrimaryKey()
    id: number

    @Property()
    title: string

    constructor(title) {
        this.title = title
    }
}

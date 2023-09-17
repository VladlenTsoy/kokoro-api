import {Entity, PrimaryKey, Property} from "@mikro-orm/core"

@Entity({tableName: "product_properties"})
export class ProductPropertyEntity {

    @PrimaryKey()
    id: number

    @Property()
    title: string

    @Property()
    description: string

    @Property({default: false})
    is_global: boolean

    constructor(title) {
        this.title = title
    }
}

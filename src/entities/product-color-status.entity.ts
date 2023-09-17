import {Entity, PrimaryKey, Property} from "@mikro-orm/core"

@Entity({tableName: "product_statuses"})
export class ProductStatusEntity {

    @PrimaryKey()
    id: number

    @Property()
    title: string

    @Property()
    position: number

    @Property({default: false})
    is_default: boolean

    constructor(title) {
        this.title = title
    }
}

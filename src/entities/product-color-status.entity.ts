import {Entity, PrimaryKey, Property} from "@mikro-orm/core"

@Entity({tableName: "product_color_statuses"})
export class ProductColorStatusEntity {

    @PrimaryKey()
    id: number

    @Property()
    title: string

    @Property()
    position: number

    @Property({default: false})
    is_default: boolean

    constructor(title, position, is_default) {
        this.title = title
        this.position = position
        this.is_default = is_default
    }
}

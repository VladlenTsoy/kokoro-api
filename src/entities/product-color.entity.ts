import {Entity, PrimaryKey, Property} from "@mikro-orm/core"

@Entity({tableName: "product-colors"})
export class ProductColorEntity {

    @PrimaryKey()
    id: number

    @Property()
    title: string

    @Property()
    price: number

    @Property()
    product_id: number

    @Property()
    color_id: number

    @Property()
    status_id: number

    @Property({nullable: true, default: null})
    is_new: boolean

    @Property({nullable: true, default: null})
    is_hide: boolean

    @Property({type: "timestamp"})
    created_at: Date = new Date()

    constructor(title, price, product_id, color_id, status_id, is_new, is_hide) {
        this.title = title
        this.price = price
        this.product_id = product_id
        this.color_id = color_id
        this.status_id = status_id
        this.is_new = is_new
        this.is_hide = is_hide
    }
}

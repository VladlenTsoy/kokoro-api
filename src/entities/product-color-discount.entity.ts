import {Entity, PrimaryKey, Property} from "@mikro-orm/core"

@Entity({tableName: "product-color-discounts"})
export class ProductColorDiscountEntity {

    @PrimaryKey()
    id: number

    @Property({type: "float"})
    discount: number

    @Property()
    product_color_id: number

    @Property({type: "datetime"})
    end_at: string

    @Property({type: "timestamp"})
    created_at: Date = new Date()

    constructor(discount, end_at, product_color_id) {
        this.discount = discount
        this.end_at = end_at
        this.product_color_id = product_color_id
    }
}

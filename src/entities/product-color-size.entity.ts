import {Entity, PrimaryKey, Property} from "@mikro-orm/core"

@Entity({tableName: "product-color-sizes"})
export class ProductSizeEntity {

    @PrimaryKey()
    id: number

    @Property()
    product_color_id: number

    @Property()
    size_id: string

    @Property()
    cost_price: number

    constructor(product_color_id, size_id, cost_price) {
        this.product_color_id = product_color_id
        this.size_id = size_id
        this.cost_price = cost_price
    }
}

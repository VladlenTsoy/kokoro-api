import {Entity, PrimaryKey, Property} from "@mikro-orm/core"

@Entity({tableName: "product-color-measurements"})
export class ProductColorMeasurementEntity {

    @PrimaryKey()
    id: number

    @Property()
    title: number

    @Property({type: "jsonb"})
    description: object

    @Property()
    product_color_id: number

    constructor(title, description, product_color_id) {
        this.title = title
        this.description = description
        this.product_color_id = product_color_id
    }
}

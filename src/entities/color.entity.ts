import {Entity, PrimaryKey, Property} from "@mikro-orm/core"

@Entity({tableName: "colors"})
export class ColorEntity {

    @PrimaryKey()
    id: number

    @Property()
    title: string

    @Property()
    hex: string

    @Property({nullable: true, default: null})
    is_hide: boolean

    constructor(title, hex, is_hide) {
        this.title = title
        this.hex = hex
        this.is_hide = is_hide
    }
}

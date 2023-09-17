import {Entity, PrimaryKey, Property} from "@mikro-orm/core"

@Entity({tableName: "sizes"})
export class SizeEntity {

    @PrimaryKey()
    id: number

    @Property()
    title: string

    @Property({nullable: true, default: null})
    is_hide: boolean

    constructor(title: string, is_hide?: boolean) {
        this.title = title
        this.is_hide = is_hide
    }
}

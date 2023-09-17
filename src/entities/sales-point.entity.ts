import {Entity, PrimaryKey, Property} from "@mikro-orm/core"

@Entity({tableName: "sales"})
export class TagEntity {

    @PrimaryKey()
    id: number

    @Property()
    title: string

    constructor(title) {
        this.title = title
    }
}

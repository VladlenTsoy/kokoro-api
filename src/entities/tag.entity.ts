import {Entity, PrimaryKey, Property} from "@mikro-orm/core"

@Entity({tableName: "tags"})
export class TagEntity {

    @PrimaryKey()
    id: number

    @Property()
    title: string

    constructor(title) {
        this.title = title
    }
}

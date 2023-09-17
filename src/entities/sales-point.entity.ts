import {Entity, PrimaryKey, Property} from "@mikro-orm/core"

@Entity({tableName: "sales-points"})
export class SalesPointEntity {

    @PrimaryKey()
    id: number

    @Property()
    title: string

    @Property({type: "jsonb", nullable: true, default: null})
    location: object

    constructor(title: string, location: {lat: number, lng: number} | null) {
        this.title = title
        this.location = location
    }
}

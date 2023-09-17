import {Entity, PrimaryKey, Property} from "@mikro-orm/core"

@Entity({tableName: "client_addresses"})
export class ClientAddressEntity {
    @PrimaryKey()
    id: number

    @Property()
    title: string

    @Property()
    full_name: string

    @Property()
    phone: string

    @Property({nullable: true})
    country: string

    @Property({nullable: true})
    city: string

    @Property({nullable: true})
    address: string

    @Property({nullable: true, type: "jsonb"})
    position: string

    @Property()
    client_id: number

    @Property({type: "timestamp"})
    created_at: Date = new Date()

    constructor(phone, full_name, email, password, source_id, created_at) {
        this.phone = phone
        this.full_name = full_name
        this.phone = email
        this.country = password
        this.city = source_id
        this.address = created_at
        this.position = created_at
        this.client_id = created_at
    }
}

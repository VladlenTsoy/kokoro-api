import {Entity, PrimaryKey, Property, Unique} from "@mikro-orm/core"

@Entity({tableName: "clients"})
export class ClientEntity {

    @PrimaryKey()
    id: number

    @Property({nullable: true})
    phone?: string | null

    @Property()
    full_name: string

    @Property({nullable: true})
    @Unique()
    email?: string | null

    @Property({nullable: true})
    password?: string | null

    @Property()
    source_id: number

    @Property({type: "timestamp"})
    created_at: Date = new Date()

    constructor(phone, full_name, email, password, source_id) {
        this.phone = phone
        this.full_name = full_name
        this.email = email
        this.password = password
        this.source_id = source_id
    }
}

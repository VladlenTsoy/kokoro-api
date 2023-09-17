import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class MikroBook {

    @PrimaryKey()
    id: number;

    @Property()
    title: string;

    @Property()
    author: string;

    constructor(title: string, author: string) {
        this.title = title;
        this.author = author;
    }
}

import {ApiProperty} from "@nestjs/swagger"
import {Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn} from "typeorm"
import {ProductVariantEntity} from "../../product-variant/entities/product-variant.entity"

@Entity("collections")
export class CollectionEntity {
    @ApiProperty({example: 1, description: "Collection id"})
    @PrimaryGeneratedColumn()
    id: number

    @ApiProperty({example: "Summer 2026", description: "Collection title"})
    @Column({type: "varchar", length: 150, unique: true})
    title: string

    @ManyToMany(() => ProductVariantEntity, (productVariant) => productVariant.collections)
    productVariants: ProductVariantEntity[]

    @CreateDateColumn()
    createdAt: Date
}

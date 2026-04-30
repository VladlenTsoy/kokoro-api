import {ApiProperty} from "@nestjs/swagger"
import {Column, CreateDateColumn, Entity, Index, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm"
import {ProductVariantEntity} from "../../product-variant/entities/product-variant.entity"

export enum ProductTagType {
    COLOR_PALETTE = "color_palette",
    SEASON = "season",
    STYLE = "style",
    ANIME = "anime",
    MATERIAL = "material",
    FIT = "fit",
    OCCASION = "occasion",
    CUSTOM = "custom"
}

@Entity("product_tags")
export class ProductTagEntity {
    @ApiProperty({
        example: 1,
        description: "The id of the product tag",
        required: true
    })
    @PrimaryGeneratedColumn()
    id: number

    @ApiProperty({
        example: "Pastel",
        description: "The title of the product tag",
        required: true
    })
    @Column({type: "varchar", length: 100})
    title: string

    @ApiProperty({
        example: "pastel",
        description: "Normalized unique tag slug",
        required: true
    })
    @Index("IDX_product_tags_slug", {unique: true})
    @Column({type: "varchar", length: 120})
    slug: string

    @ApiProperty({
        example: ProductTagType.COLOR_PALETTE,
        description: "Tag merchandising type",
        enum: ProductTagType,
        required: true
    })
    @Index("IDX_product_tags_type")
    @Column({type: "varchar", length: 32, default: ProductTagType.CUSTOM})
    type: ProductTagType

    @ApiProperty({
        example: "#F4C2C2",
        description: "Optional swatch color for color palette tags",
        required: false
    })
    @Column({type: "varchar", length: 20, nullable: true})
    colorHex?: string | null

    @ApiProperty({
        example: true,
        description: "Controls whether tag is visible for client filters",
        required: true
    })
    @Column({type: "boolean", default: true})
    isActive: boolean

    @ApiProperty({
        example: 100,
        description: "Sorting priority inside tag type",
        required: true
    })
    @Column({type: "int", default: 100})
    sortOrder: number

    @ManyToMany(() => ProductVariantEntity, (variant) => variant.tags)
    variants: ProductVariantEntity[]

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}

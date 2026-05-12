import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn} from "typeorm"
import {ProductVariantEntity} from "../../product-variant/entities/product-variant.entity"
import {ProductVariantSizeEntity} from "../../product-variant-size/entities/product-variant-size.entity"

export enum ProductBarcodeType {
    BARCODE = "barcode",
    QR = "qr",
    INTERNAL = "internal"
}

@Entity("product_barcodes")
@Unique("IDX_product_barcodes_code_unique", ["code"])
export class ProductBarcodeEntity {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => ProductVariantEntity, {nullable: false, onDelete: "CASCADE"})
    productVariant: ProductVariantEntity

    @ManyToOne(() => ProductVariantSizeEntity, {nullable: true, onDelete: "CASCADE"})
    productVariantSize?: ProductVariantSizeEntity | null

    @Column({type: "varchar", length: 120})
    code: string

    @Column({type: "enum", enum: ProductBarcodeType, default: ProductBarcodeType.BARCODE})
    type: ProductBarcodeType

    @Column({type: "boolean", default: true})
    isActive: boolean

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}

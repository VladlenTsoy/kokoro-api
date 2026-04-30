import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm"

export enum PromoCodeDiscountType {
    PERCENT = "percent",
    FIXED = "fixed"
}

@Entity("promo_codes")
export class PromoCodeEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({type: "varchar", length: 64, unique: true})
    code: string

    @Column({type: "enum", enum: PromoCodeDiscountType})
    discountType: PromoCodeDiscountType

    @Column({type: "int"})
    discountValue: number

    @Column({type: "int", default: 0})
    minOrderTotal: number

    @Column({type: "int", nullable: true})
    usageLimit?: number | null

    @Column({type: "int", default: 0})
    usedCount: number

    @Column({type: "datetime", nullable: true})
    startsAt?: Date | null

    @Column({type: "datetime", nullable: true})
    endsAt?: Date | null

    @Column({type: "boolean", default: true})
    isActive: boolean

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}

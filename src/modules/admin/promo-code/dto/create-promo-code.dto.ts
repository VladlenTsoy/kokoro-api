import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger"
import {IsBoolean, IsEnum, IsInt, IsOptional, IsString, MaxLength, Min} from "class-validator"
import {Type} from "class-transformer"
import {PromoCodeDiscountType} from "../entities/promo-code.entity"

export class CreatePromoCodeDto {
    @ApiProperty({example: "WELCOME10"})
    @IsString()
    @MaxLength(64)
    code: string

    @ApiProperty({enum: PromoCodeDiscountType})
    @IsEnum(PromoCodeDiscountType)
    discountType: PromoCodeDiscountType

    @ApiProperty({example: 10})
    @Type(() => Number)
    @IsInt()
    @Min(1)
    discountValue: number

    @ApiPropertyOptional({example: 100000})
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    minOrderTotal?: number

    @ApiPropertyOptional({example: 100})
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    usageLimit?: number

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    startsAt?: string

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    endsAt?: string

    @ApiPropertyOptional({default: true})
    @IsOptional()
    @IsBoolean()
    isActive?: boolean
}

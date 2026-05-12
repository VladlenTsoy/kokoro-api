import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger"
import {IsBoolean, IsEnum, IsInt, IsOptional, IsString, MaxLength} from "class-validator"
import {ProductBarcodeType} from "../entities/product-barcode.entity"

export class CreateProductBarcodeDto {
    @ApiProperty({example: 1})
    @IsInt()
    productVariantId: number

    @ApiPropertyOptional({example: 1})
    @IsOptional()
    @IsInt()
    productVariantSizeId?: number

    @ApiProperty({example: "4780012345678"})
    @IsString()
    @MaxLength(120)
    code: string

    @ApiPropertyOptional({enum: ProductBarcodeType})
    @IsOptional()
    @IsEnum(ProductBarcodeType)
    type?: ProductBarcodeType

    @ApiPropertyOptional({example: true})
    @IsOptional()
    @IsBoolean()
    isActive?: boolean
}

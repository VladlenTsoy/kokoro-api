import {IsBoolean, IsEnum, IsHexColor, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min} from "class-validator"
import {ApiProperty} from "@nestjs/swagger"
import {Type} from "class-transformer"
import {ProductTagType} from "../entities/product-tag.entity"

export class CreateProductTagDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    @ApiProperty({
        example: "Pastel",
        description: "The title of the product tag",
        required: true
    })
    title: string

    @IsOptional()
    @IsString()
    @MaxLength(120)
    @ApiProperty({
        example: "pastel",
        description: "Optional slug. If omitted, backend generates it from title",
        required: false
    })
    slug?: string

    @IsOptional()
    @IsEnum(ProductTagType)
    @ApiProperty({
        example: ProductTagType.COLOR_PALETTE,
        enum: ProductTagType,
        required: false
    })
    type?: ProductTagType

    @IsOptional()
    @IsHexColor()
    @ApiProperty({
        example: "#F4C2C2",
        required: false
    })
    colorHex?: string

    @IsOptional()
    @IsBoolean()
    @ApiProperty({example: true, required: false})
    isActive?: boolean

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @ApiProperty({example: 100, required: false})
    sortOrder?: number
}

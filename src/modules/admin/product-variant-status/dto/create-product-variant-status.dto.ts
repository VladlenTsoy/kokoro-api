import {ApiProperty} from "@nestjs/swagger"
import {IsBoolean, IsInt, IsOptional, IsString} from "class-validator"

export class CreateProductVariantStatusDto {
    @ApiProperty({
        example: "Draft",
        description: "The title of the product variant status",
        required: true
    })
    @IsString()
    title: string

    @ApiProperty({
        example: 1,
        description: "The position of the product variant status",
        required: false
    })
    @IsInt()
    @IsOptional()
    position: number

    @ApiProperty({
        example: true,
        description: "The is_default of the product variant status",
        required: false
    })
    @IsOptional()
    @IsBoolean()
    is_default: boolean
}

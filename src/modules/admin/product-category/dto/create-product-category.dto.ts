import {IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString} from "class-validator"
import {ApiProperty} from "@nestjs/swagger"

export class CreateProductCategoryDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: "Product category title",
        description: "The title of the product category",
        required: true
    })
    title: string

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        example: 1,
        description: "The parent_category_id of the product category",
        default: null,
        required: false
    })
    parent_category_id: number | null

    @IsString()
    @ApiProperty({
        example: "/t-shirt",
        description: "The url of the product category"
    })
    url: string

    @IsBoolean()
    @IsOptional()
    @ApiProperty({
        example: true,
        description: "The is_hide of the product category",
        default: null,
        required: false
    })
    is_hide: boolean | null
}

import {IsBoolean, IsNotEmpty, IsNumber, IsString} from "class-validator"
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
    @ApiProperty({
        example: 1,
        description: "The parent_category_id of the product category",
        default: null
    })
    parent_category_id: number | null

    @IsString()
    @ApiProperty({
        example: "/t-shirt",
        description: "The url of the product category"
    })
    url: string

    @IsBoolean()
    @ApiProperty({
        example: true,
        description: "The is_hide of the product category",
        default: null
    })
    is_hide: boolean | null
}

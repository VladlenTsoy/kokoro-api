import {IsNotEmpty, IsNumber, IsPositive, IsString} from "class-validator"
import {ApiProperty} from "@nestjs/swagger"

export class CreateProductVariantImageDto {
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    @ApiProperty({
        example: 1,
        description: "The product_color_id of the product_color_image",
        required: true
    })
    product_color_id: number

    @IsString()
    @ApiProperty({
        example: "Product color image name",
        description: "The name of the product_color_image"
    })
    name: string

    @IsString()
    @ApiProperty({
        example: "Product color image path",
        description: "The path of the product_color_image"
    })
    path: string

    @IsNumber()
    @IsPositive()
    @ApiProperty({
        example: 4096,
        description: "The size of the product_color_image"
    })
    size: number

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    @ApiProperty({
        example: 1,
        description: "The position of the product_color_image",
        required: true
    })
    position: number
}

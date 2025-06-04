import {IsNotEmpty, IsNumber, IsPositive, IsString} from "class-validator"
import {ApiProperty} from "@nestjs/swagger"

export class CreateProductVariantImageDto {
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    @ApiProperty({
        example: 1,
        description: "The product_variant_id of the product_variant_image",
        required: true
    })
    product_variant_id: number

    @IsString()
    @ApiProperty({
        example: "Product variant image name",
        description: "The name of the product_variant_image"
    })
    name: string

    @IsString()
    @ApiProperty({
        example: "Product variant image path",
        description: "The path of the product_variant_image"
    })
    path: string

    @IsNumber()
    @IsPositive()
    @ApiProperty({
        example: 4096,
        description: "The size of the product_variant_image"
    })
    size: number

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    @ApiProperty({
        example: 1,
        description: "The position of the product_variant_image",
        required: true
    })
    position: number
}

import {IsNotEmpty, IsNumber, IsPositive} from "class-validator"
import {ApiProperty} from "@nestjs/swagger"

export class CreateProductVariantSizeDto {
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    @ApiProperty({
        example: 1,
        description: "The product_color_id of the product size",
        required: true
    })
    product_color_id: number

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    @ApiProperty({
        example: 1,
        description: "The size_id of the product size",
        required: true
    })
    size_id: number

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({
        example: 5000,
        description: "The price of the product size",
        required: true
    })
    cost_price: number

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({
        example: 200,
        description: "The qty of the product size",
        required: true
    })
    qty: number

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({
        example: 20,
        description: "The min_qty of the product size",
        required: true
    })
    min_qty: number
}

import {
    IsArray,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    ValidateNested
} from "class-validator"
import {ApiProperty} from "@nestjs/swagger"
import {Type} from "class-transformer"

export class ProductSizeDto {
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

export class CreateProductColorDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: "Product color title",
        description: "The title of the product color",
        required: true
    })
    title: string

    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    @ApiProperty({
        example: 50000,
        description: "The price of the product color",
        required: true
    })
    price: number

    @IsNumber()
    @IsPositive()
    @IsOptional()
    @ApiProperty({
        example: 1,
        description: "The product_id of the product color",
        required: false
    })
    product_id?: number

    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    @ApiProperty({
        example: 1,
        description: "The color_id of the product color",
        required: true
    })
    color_id: number

    @IsArray()
    @ValidateNested({each: true})
    @Type(() => ProductSizeDto)
    @IsNotEmpty()
    @ApiProperty({
        type: [ProductSizeDto],
        description: "The product_sizes of the product color",
        required: true
    })
    product_sizes: ProductSizeDto[]
}

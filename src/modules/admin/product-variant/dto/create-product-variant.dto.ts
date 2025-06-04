import {IsArray, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, ValidateNested} from "class-validator"
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

export class ProductImageDto {
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

export class CreateProductVariantDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: "Product variant title",
        description: "The title of the product variant",
        required: true
    })
    title: string

    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    @ApiProperty({
        example: 50000,
        description: "The price of the product variant",
        required: true
    })
    price: number

    @IsNumber()
    @IsPositive()
    @IsOptional()
    @ApiProperty({
        example: 1,
        description: "The product_id of the product variant",
        required: false
    })
    product_id?: number

    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    @ApiProperty({
        example: 1,
        description: "The category_id of the product variant",
        required: true
    })
    category_id: number

    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    @ApiProperty({
        example: 1,
        description: "The color_id of the product variant",
        required: true
    })
    color_id: number

    @IsArray()
    @ValidateNested({each: true})
    @Type(() => ProductSizeDto)
    @IsNotEmpty()
    @ApiProperty({
        type: [ProductSizeDto],
        description: "The product_sizes of the product variant",
        required: true
    })
    product_sizes: ProductSizeDto[]

    @IsArray()
    @ValidateNested({each: true})
    @Type(() => ProductImageDto)
    @IsNotEmpty()
    @ApiProperty({
        type: [ProductImageDto],
        description: "The product_images of the product variant",
        required: true
    })
    product_images: ProductImageDto[]

    @ApiProperty({type: [Number], description: "List id tags"})
    @IsOptional()
    @IsArray()
    tags?: number[]
}

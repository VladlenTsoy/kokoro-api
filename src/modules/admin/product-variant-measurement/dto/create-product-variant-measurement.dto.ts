import {IsArray, IsNumber, IsString} from "class-validator"
import {ApiProperty} from "@nestjs/swagger"
import {ProductVariantEntity} from "../../product-variant/entities/product-variant.entity"

export class CreateProductVariantMeasurementDto {
    @ApiProperty({example: "Название обмера"})
    @IsString()
    title: string

    @ApiProperty({example: "Описание обмера"})
    @IsArray()
    descriptions?: Record<number, string>[]

    @ApiProperty({example: ProductVariantEntity, description: "Вариант товара"})
    @IsNumber()
    productVariant: ProductVariantEntity
}

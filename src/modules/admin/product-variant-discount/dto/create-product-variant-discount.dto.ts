import {IsDateString, IsNumber, IsOptional} from "class-validator"
import {ApiProperty} from "@nestjs/swagger"
import {ProductVariantEntity} from "../../product-variant/entities/product-variant.entity"

export class CreateProductVariantDiscountDto {
    @ApiProperty({example: 15.5, description: "Процент скидки"})
    @IsNumber()
    discountPercent: number

    @ApiProperty({example: "2025-06-01T00:00:00.000Z", description: "Дата начала скидки"})
    @IsOptional()
    @IsDateString()
    startDate?: Date

    @ApiProperty({example: "2025-06-15T00:00:00.000Z", description: "Дата окончания скидки"})
    @IsOptional()
    @IsDateString()
    endDate?: Date

    @ApiProperty({example: 1, description: "ID варианта товара"})
    @IsNumber()
    productVariant: ProductVariantEntity
}

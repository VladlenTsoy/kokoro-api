import {IsNumber, IsDateString} from "class-validator"
import {ApiProperty} from "@nestjs/swagger"

export class CreateProductVariantDiscountDto {
    @ApiProperty({example: 15.5, description: "Процент скидки"})
    @IsNumber()
    discountPercent: number

    @ApiProperty({example: "2025-06-01T00:00:00.000Z", description: "Дата начала скидки"})
    @IsDateString()
    startDate: Date

    @ApiProperty({example: "2025-06-15T00:00:00.000Z", description: "Дата окончания скидки"})
    @IsDateString()
    endDate: Date

    @ApiProperty({example: 1, description: "ID варианта товара"})
    @IsNumber()
    variantId: number
}

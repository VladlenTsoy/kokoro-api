import {IsNumber, IsOptional} from "class-validator"
import {ApiProperty} from "@nestjs/swagger"

export class CreateProductVariantMeasurementDto {
    @ApiProperty({example: 10.5})
    @IsOptional()
    @IsNumber()
    width?: number

    @ApiProperty({example: 20.0})
    @IsOptional()
    @IsNumber()
    height?: number

    @ApiProperty({example: 30.0})
    @IsOptional()
    @IsNumber()
    length?: number

    @ApiProperty({example: 1.5})
    @IsOptional()
    @IsNumber()
    weight?: number

    @ApiProperty({example: 1, description: "ID варианта продукта"})
    @IsNumber()
    variantId: number
}

import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger"
import {IsInt, IsNumber, IsOptional, Min} from "class-validator"

export class OpenPosShiftDto {
    @ApiProperty({example: 1})
    @IsInt()
    salesPointId: number

    @ApiPropertyOptional({example: 1})
    @IsOptional()
    @IsInt()
    deviceId?: number

    @ApiPropertyOptional({example: 0})
    @IsOptional()
    @IsNumber()
    @Min(0)
    openingCashAmount?: number
}

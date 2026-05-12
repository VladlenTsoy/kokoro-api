import {ApiPropertyOptional} from "@nestjs/swagger"
import {IsNumber, IsOptional, IsString, MaxLength, Min} from "class-validator"

export class ClosePosShiftDto {
    @ApiPropertyOptional({example: 1250000})
    @IsOptional()
    @IsNumber()
    @Min(0)
    closingCashAmount?: number

    @ApiPropertyOptional({example: "Shift closed normally"})
    @IsOptional()
    @IsString()
    @MaxLength(255)
    comment?: string
}

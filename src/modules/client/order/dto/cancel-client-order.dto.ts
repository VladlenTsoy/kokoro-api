import {ApiPropertyOptional} from "@nestjs/swagger"
import {IsOptional, IsString, MaxLength} from "class-validator"

export class CancelClientOrderDto {
    @ApiPropertyOptional({example: "Ordered by mistake"})
    @IsOptional()
    @IsString()
    @MaxLength(255)
    reason?: string
}

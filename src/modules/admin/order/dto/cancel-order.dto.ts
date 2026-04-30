import {ApiPropertyOptional} from "@nestjs/swagger"
import {IsOptional, IsString, MaxLength} from "class-validator"

export class CancelOrderDto {
    @ApiPropertyOptional({example: "Client changed their mind"})
    @IsOptional()
    @IsString()
    @MaxLength(255)
    reason?: string
}

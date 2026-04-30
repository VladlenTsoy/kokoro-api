import {ApiPropertyOptional} from "@nestjs/swagger"
import {IsOptional, IsString, MaxLength, MinLength} from "class-validator"

export class UpdateClientProfileDto {
    @ApiPropertyOptional({example: "Ali Karimov"})
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(255)
    name?: string
}

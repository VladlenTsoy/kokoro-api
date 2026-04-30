import {ApiPropertyOptional} from "@nestjs/swagger"
import {IsBoolean, IsOptional, IsString, MaxLength, MinLength} from "class-validator"

export class UpdateAdminClientDto {
    @ApiPropertyOptional({example: "Ali Karimov"})
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(255)
    name?: string

    @ApiPropertyOptional({example: "+998901234567"})
    @IsOptional()
    @IsString()
    @MaxLength(50)
    phone?: string

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isActive?: boolean
}

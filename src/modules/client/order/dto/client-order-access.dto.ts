import {ApiPropertyOptional} from "@nestjs/swagger"
import {IsOptional, IsString} from "class-validator"

export class ClientOrderAccessDto {
    @ApiPropertyOptional({description: "Guest order access token returned when order was created"})
    @IsOptional()
    @IsString()
    accessToken?: string
}

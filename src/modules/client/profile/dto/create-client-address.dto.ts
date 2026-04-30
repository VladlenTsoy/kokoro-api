import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger"
import {IsNotEmpty, IsOptional, IsString, MaxLength} from "class-validator"

export class CreateClientAddressDto {
    @ApiProperty({example: "Tashkent, Yunusabad"})
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    address: string

    @ApiPropertyOptional({example: {lat: 41.3111, lng: 69.2797}})
    @IsOptional()
    location?: Record<string, any>
}

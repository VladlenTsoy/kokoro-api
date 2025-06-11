import {IsString} from "class-validator"
import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger"

class GeoLocationDto {
    @ApiProperty()
    lat: number

    @ApiProperty()
    lng: number
}

export class CreateSalesPointDto {
    @ApiProperty({example: "Филиал Ташкент"})
    @IsString()
    title: string

    @ApiPropertyOptional({type: GeoLocationDto})
    location: GeoLocationDto
}

import {IsString, IsOptional, IsNotEmpty} from "class-validator"
import {ApiProperty} from "@nestjs/swagger"

export class CreateCountryDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: "Country name",
        description: "The name of the country",
        required: true
    })
    name: string

    @IsOptional()
    @IsString()
    @ApiProperty({
        example: "/link-to-flag",
        description: "The flag of the country",
        required: false
    })
    flag?: string

    @IsOptional()
    @ApiProperty({
        example: {lat: 41.311081, lng: 69.240562},
        description: "The position of the country",
        required: false
    })
    position?: {lat: number; lng: number}
}

import {IsString, IsNumber, IsOptional} from "class-validator"
import {ApiProperty} from "@nestjs/swagger"

export class CreateCityDto {
    @ApiProperty()
    @IsString()
    name: string

    @ApiProperty()
    @IsNumber()
    countryId: number

    @ApiProperty({required: false})
    @IsOptional()
    position?: any
}

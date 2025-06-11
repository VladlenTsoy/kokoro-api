import {IsString, IsOptional} from "class-validator"
import {ApiProperty} from "@nestjs/swagger"

export class CreateCountryDto {
    @ApiProperty()
    @IsString()
    name: string

    @ApiProperty({required: false})
    @IsOptional()
    @IsString()
    flag?: string

    @ApiProperty({required: false})
    @IsOptional()
    position?: any
}

import {IsString, IsNumber, IsOptional} from "class-validator"
import {ApiProperty} from "@nestjs/swagger"

export class CreateOrderAddressDto {
    @ApiProperty()
    @IsNumber()
    orderId: number

    @ApiProperty({required: false})
    @IsOptional()
    @IsNumber()
    countryId?: number

    @ApiProperty({required: false})
    @IsOptional()
    @IsNumber()
    cityId?: number

    @ApiProperty()
    @IsString()
    address: string

    @ApiProperty({required: false})
    @IsOptional()
    @IsString()
    comment?: string

    @ApiProperty({required: false})
    @IsOptional()
    @IsString()
    entrance?: string

    @ApiProperty({required: false})
    @IsOptional()
    @IsString()
    floor?: string

    @ApiProperty({required: false})
    @IsOptional()
    @IsString()
    intercom?: string

    @ApiProperty({required: false})
    @IsOptional()
    position?: any
}

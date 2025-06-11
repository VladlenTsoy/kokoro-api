import {IsString, IsEnum, IsOptional, IsNumber} from "class-validator"
import {ApiProperty} from "@nestjs/swagger"
import {DeliveryTypeEnum} from "../entities/delivery-type.entity"

export class CreateDeliveryTypeDto {
    @ApiProperty()
    @IsString()
    title: string

    @ApiProperty({enum: DeliveryTypeEnum})
    @IsEnum(DeliveryTypeEnum)
    type: DeliveryTypeEnum

    @ApiProperty()
    @IsNumber()
    price: number

    @ApiProperty({required: false})
    @IsOptional()
    @IsString()
    description?: string

    @ApiProperty({required: false})
    @IsOptional()
    @IsNumber()
    cityId?: number
}

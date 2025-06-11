import {IsInt, IsString, IsOptional} from "class-validator"
import {ApiProperty} from "@nestjs/swagger"

export class CreateOrderDto {
    @ApiProperty()
    @IsInt()
    statusId: number

    @ApiProperty({required: false})
    @IsOptional()
    @IsInt()
    paymentMethodId?: number

    @ApiProperty({required: false})
    @IsOptional()
    @IsInt()
    sourceId?: number

    @ApiProperty({required: false})
    @IsOptional()
    @IsInt()
    deliveryTypeId?: number

    @ApiProperty()
    @IsInt()
    total: number

    @ApiProperty({required: false})
    @IsOptional()
    @IsString()
    phone?: string

    @ApiProperty({required: false})
    @IsOptional()
    @IsString()
    clientName?: string

    @ApiProperty({required: false})
    @IsOptional()
    @IsString()
    comment?: string
}

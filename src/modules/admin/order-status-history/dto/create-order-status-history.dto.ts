import {IsNumber, IsOptional, IsString} from "class-validator"
import {ApiProperty} from "@nestjs/swagger"

export class CreateOrderStatusHistoryDto {
    @ApiProperty()
    @IsNumber()
    orderId: number

    @ApiProperty()
    @IsNumber()
    fromStatusId: number

    @ApiProperty()
    @IsNumber()
    toStatusId: number

    @ApiProperty({required: false})
    @IsOptional()
    @IsString()
    changedBy?: string
}

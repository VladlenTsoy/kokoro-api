import {IsNumber, IsBoolean} from "class-validator"
import {ApiProperty} from "@nestjs/swagger"

export class CreateOrderItemDto {
    @ApiProperty()
    @IsNumber()
    orderId: number

    @ApiProperty()
    @IsNumber()
    productVariantId: number

    @ApiProperty()
    @IsNumber()
    sizeId: number

    @ApiProperty()
    @IsNumber()
    qty: number

    @ApiProperty()
    @IsNumber()
    price: number

    @ApiProperty()
    @IsBoolean()
    promotion: boolean

    @ApiProperty()
    @IsNumber()
    discount: number
}

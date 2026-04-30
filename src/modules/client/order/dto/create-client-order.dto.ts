import {ApiProperty} from "@nestjs/swagger"
import {IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Min, ValidateNested} from "class-validator"
import {Type} from "class-transformer"

export class CreateClientOrderClientDto {
    @ApiProperty({example: "John Doe"})
    @IsString()
    @IsNotEmpty()
    name: string

    @ApiProperty({example: "+998901234567"})
    @IsString()
    @IsNotEmpty()
    phone: string
}

class CreateClientOrderAddressDto {
    @ApiProperty({example: "Tashkent, Yunusabad"})
    @IsString()
    @IsNotEmpty()
    address: string

    @ApiProperty({example: {lat: 41.3111, lng: 69.2797}, required: false})
    @IsOptional()
    location?: Record<string, any>
}

class CreateClientOrderItemDto {
    @ApiProperty({example: 10})
    @Type(() => Number)
    @IsInt()
    @Min(1)
    productVariantId: number

    @ApiProperty({example: 2})
    @Type(() => Number)
    @IsInt()
    @Min(1)
    qty: number

    @ApiProperty({example: 12, required: false})
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    sizeId?: number
}

export class CreateClientOrderDto {
    @ApiProperty({type: CreateClientOrderClientDto, required: false})
    @IsOptional()
    @ValidateNested()
    @Type(() => CreateClientOrderClientDto)
    client?: CreateClientOrderClientDto

    @ApiProperty({type: CreateClientOrderAddressDto})
    @ValidateNested()
    @Type(() => CreateClientOrderAddressDto)
    address: CreateClientOrderAddressDto

    @ApiProperty({type: [CreateClientOrderItemDto]})
    @IsArray()
    @ValidateNested({each: true})
    @Type(() => CreateClientOrderItemDto)
    items: CreateClientOrderItemDto[]

    @ApiProperty({required: false, example: "Please call before delivery"})
    @IsOptional()
    @IsString()
    comment?: string

    @ApiProperty({required: false, example: 1})
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    paymentMethodId?: number

    @ApiProperty({required: false, example: 1})
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    sourceId?: number

    @ApiProperty({required: false, example: 1})
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    deliveryTypeId?: number

    @ApiProperty({required: false, example: "WELCOME10"})
    @IsOptional()
    @IsString()
    promoCode?: string

    @ApiProperty({required: false, example: 10000})
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    bonusToSpend?: number
}

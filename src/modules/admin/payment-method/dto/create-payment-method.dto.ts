import {IsString, IsBoolean} from "class-validator"
import {ApiProperty} from "@nestjs/swagger"

export class CreatePaymentMethodDto {
    @ApiProperty()
    @IsString()
    title: string

    @ApiProperty()
    @IsString()
    code: string

    @ApiProperty()
    @IsBoolean()
    isActive: boolean

    @ApiProperty()
    @IsBoolean()
    isCash: boolean

    @ApiProperty()
    @IsBoolean()
    isCard: boolean

    @ApiProperty()
    @IsBoolean()
    isOnline: boolean
}

import {ApiProperty} from "@nestjs/swagger"
import {IsNotEmpty, IsString, Matches} from "class-validator"

export class SendClientPhoneCodeDto {
    @ApiProperty({example: "+998901234567"})
    @IsString()
    @IsNotEmpty()
    @Matches(/^\+[1-9]\d{7,14}$/, {message: "phoneNumber must be in E.164 format"})
    phoneNumber: string
}

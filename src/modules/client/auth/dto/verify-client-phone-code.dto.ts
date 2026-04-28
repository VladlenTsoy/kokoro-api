import {ApiProperty} from "@nestjs/swagger"
import {IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength} from "class-validator"

export class VerifyClientPhoneCodeDto {
    @ApiProperty({example: "+998901234567"})
    @IsString()
    @IsNotEmpty()
    @Matches(/^\+[1-9]\d{7,14}$/, {message: "phoneNumber must be in E.164 format"})
    phoneNumber: string

    @ApiProperty({example: "abc123-request-id"})
    @IsString()
    @IsNotEmpty()
    requestId: string

    @ApiProperty({example: "1234"})
    @IsString()
    @IsNotEmpty()
    @Matches(/^\d{4,8}$/, {message: "code must contain 4 to 8 digits"})
    code: string

    @ApiProperty({example: "Ali", required: false})
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(255)
    name?: string
}

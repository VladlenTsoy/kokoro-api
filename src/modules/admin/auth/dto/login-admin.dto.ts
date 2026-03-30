import {ApiProperty} from "@nestjs/swagger"
import {IsEmail, IsNotEmpty, IsString, MaxLength, MinLength} from "class-validator"

export class LoginAdminDto {
    @ApiProperty({example: "admin@kokoro.uz"})
    @IsEmail()
    email: string

    @ApiProperty({example: "StrongPassword123"})
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(100)
    password: string
}

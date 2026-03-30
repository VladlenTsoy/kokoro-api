import {ApiProperty} from "@nestjs/swagger"
import {IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength} from "class-validator"

export class BootstrapAdminDto {
    @ApiProperty({example: "admin@kokoro.uz"})
    @IsEmail()
    email: string

    @ApiProperty({example: "Super"})
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    firstName: string

    @ApiProperty({example: "Admin"})
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    lastName: string

    @ApiProperty({example: "+998901234567", required: false})
    @IsOptional()
    @IsString()
    @MaxLength(30)
    phone?: string

    @ApiProperty({example: "StrongPassword123"})
    @IsString()
    @MinLength(8)
    @MaxLength(100)
    password: string
}

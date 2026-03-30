import {ApiProperty} from "@nestjs/swagger"
import {IsArray, IsBoolean, IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength} from "class-validator"

export class CreateEmployeeDto {
    @ApiProperty({example: "john.doe@kokoro.uz"})
    @IsEmail()
    email: string

    @ApiProperty({example: "John"})
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    firstName: string

    @ApiProperty({example: "Doe"})
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    lastName: string

    @ApiProperty({example: "+998901234567", required: false})
    @IsString()
    @IsOptional()
    @MaxLength(30)
    phone?: string

    @ApiProperty({example: "StrongPassword123"})
    @IsString()
    @MinLength(8)
    @MaxLength(100)
    password: string

    @ApiProperty({example: [1, 2], required: false})
    @IsArray()
    @IsOptional()
    @IsInt({each: true})
    roleIds?: number[]

    @ApiProperty({example: true, required: false})
    @IsBoolean()
    @IsOptional()
    isActive?: boolean
}

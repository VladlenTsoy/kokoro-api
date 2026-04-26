import {ApiProperty} from "@nestjs/swagger"
import {IsInt, IsNotEmpty, IsOptional, IsString, Min} from "class-validator"
import {Type} from "class-transformer"

export class LoginClientTelegramDto {
    @ApiProperty({example: "123456789"})
    @IsString()
    @IsNotEmpty()
    id: string

    @ApiProperty({example: "John"})
    @IsString()
    @IsNotEmpty()
    first_name: string

    @ApiProperty({example: "Doe", required: false})
    @IsOptional()
    @IsString()
    last_name?: string

    @ApiProperty({example: "johndoe", required: false})
    @IsOptional()
    @IsString()
    username?: string

    @ApiProperty({example: "https://t.me/i/userpic/320/john.jpg", required: false})
    @IsOptional()
    @IsString()
    photo_url?: string

    @ApiProperty({example: 1760000000})
    @Type(() => Number)
    @IsInt()
    @Min(1)
    auth_date: number

    @ApiProperty({example: "70f6f6f06d2d7ec6f5af4bb9333fce4f5b5c713f67fbc603265f0c2f8c909b68"})
    @IsString()
    @IsNotEmpty()
    hash: string
}

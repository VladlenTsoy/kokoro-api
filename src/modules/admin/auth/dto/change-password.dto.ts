import {ApiProperty} from "@nestjs/swagger"
import {IsNotEmpty, IsString, MaxLength, MinLength} from "class-validator"

export class ChangePasswordDto {
    @ApiProperty({example: "OldPassword123"})
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(100)
    currentPassword: string

    @ApiProperty({example: "NewPassword123"})
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(100)
    newPassword: string
}

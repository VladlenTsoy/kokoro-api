import {ApiProperty} from "@nestjs/swagger"
import {IsNotEmpty, IsString} from "class-validator"

export class LogoutAdminDto {
    @ApiProperty({example: "1.your_refresh_token_secret"})
    @IsString()
    @IsNotEmpty()
    refreshToken: string
}

import {ApiProperty} from "@nestjs/swagger"
import {IsNotEmpty, IsString} from "class-validator"

export class LogoutClientDto {
    @ApiProperty({example: "1.client_refresh_secret"})
    @IsString()
    @IsNotEmpty()
    refreshToken: string
}

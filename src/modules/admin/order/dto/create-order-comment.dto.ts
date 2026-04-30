import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger"
import {IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength} from "class-validator"

export class CreateOrderCommentDto {
    @ApiProperty({example: "Client asked to deliver after 18:00"})
    @IsString()
    @IsNotEmpty()
    @MaxLength(2000)
    message: string

    @ApiPropertyOptional({default: false})
    @IsOptional()
    @IsBoolean()
    visibleForClient?: boolean
}

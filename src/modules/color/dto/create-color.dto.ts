import {IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString} from "class-validator"
import {ApiProperty} from "@nestjs/swagger"

export class CreateColorDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({example: "Color title", description: "The title of the color", required: true})
    title: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty({example: "#FFFFFF", description: "The hex id of the color", required: true})
    hex: string

    @IsBoolean()
    @IsOptional()
    @ApiProperty({example: true, description: "The hide of the color", required: false, default: null})
    is_hide?: boolean
}

import {IsDateString, IsNotEmpty, IsOptional, IsString} from "class-validator"
import {ApiProperty} from "@nestjs/swagger"

export class CreateColorDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: "Color title",
        description: "The title of the color",
        required: true
    })
    title: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: "#FFFFFF",
        description: "The hex id of the color",
        required: true
    })
    hex: string

    @IsDateString()
    @IsOptional()
    @ApiProperty({
        example: "2024-02-20T14:30:00Z",
        description:
            "The timestamp indicating when the record was marked as deleted",
        required: false,
        default: null
    })
    deleted_at: string | null
}

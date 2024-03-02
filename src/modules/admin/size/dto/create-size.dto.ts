import {IsBoolean, IsNotEmpty, IsOptional, IsString} from "class-validator"
import {ApiProperty} from "@nestjs/swagger"

export class CreateSizeDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: "Product category title",
        description: "The title of the product category",
        required: true
    })
    title: string

    @IsBoolean()
    @IsOptional()
    @ApiProperty({
        example: "2024-02-20T14:30:00Z",
        description:
            "The timestamp indicating when the record was marked as deleted",
        required: false,
        default: null
    })
    deleted_at: string
}

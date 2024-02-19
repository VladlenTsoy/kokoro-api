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
    readonly title: string

    @IsBoolean()
    @IsOptional()
    @ApiProperty({
        example: true,
        description: "The hide of the product category",
        required: false,
        default: null
    })
    readonly is_hide?: boolean
}

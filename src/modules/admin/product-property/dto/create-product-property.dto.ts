import {IsBoolean, IsNotEmpty, IsString} from "class-validator"
import {ApiProperty} from "@nestjs/swagger"

export class CreateProductPropertyDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: "Состав",
        description: "The title of the product property",
        required: true
    })
    title: string

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: "Описание состава",
        description: "The description of the product property",
        required: true
    })
    description: string

    @IsBoolean()
    @ApiProperty({
        example: true,
        description: "The is_global of the product property",
        default: false
    })
    is_global: boolean
}

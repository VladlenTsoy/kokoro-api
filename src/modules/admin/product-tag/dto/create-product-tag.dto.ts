import {IsNotEmpty, IsString} from "class-validator"
import {ApiProperty} from "@nestjs/swagger"

export class CreateProductTagDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: "Product tag title",
        description: "The title of the product tag",
        required: true
    })
    title: string
}

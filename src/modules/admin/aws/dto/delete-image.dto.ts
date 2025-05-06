import {IsNotEmpty, IsString} from "class-validator"
import {ApiProperty} from "@nestjs/swagger"

export class DeleteImageDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: "/path-example",
        description: "Path to delete the image",
        required: true
    })
    path: string
}

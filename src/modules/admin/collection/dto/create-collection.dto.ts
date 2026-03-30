import {ApiProperty} from "@nestjs/swagger"
import {IsNotEmpty, IsString, MaxLength} from "class-validator"

export class CreateCollectionDto {
    @ApiProperty({example: "Summer 2026"})
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    title: string
}

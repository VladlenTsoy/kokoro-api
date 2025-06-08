import {IsString, IsOptional} from "class-validator"
import {ApiProperty} from "@nestjs/swagger"

export class CreateSalesPointDto {
    @ApiProperty({example: "Филиал Ташкент"})
    @IsString()
    title: string

    @ApiProperty({type: "object", required: false})
    @IsOptional()
    location?: Record<string, any>
}

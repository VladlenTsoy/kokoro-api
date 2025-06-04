import {ApiProperty} from "@nestjs/swagger"
import {IsArray, IsOptional} from "class-validator"

export class CreateProductDto {
    category_id: number

    @ApiProperty({type: [Number], required: false})
    @IsOptional()
    @IsArray()
    properties?: number[]
}

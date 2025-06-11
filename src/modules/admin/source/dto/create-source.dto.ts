import {IsString, IsBoolean, IsOptional} from "class-validator"
import {ApiProperty} from "@nestjs/swagger"

export class CreateSourceDto {
    @ApiProperty()
    @IsString()
    title: string

    @ApiProperty({required: false})
    @IsOptional()
    @IsString()
    code?: string

    @ApiProperty()
    @IsBoolean()
    isActive: boolean
}

import {IsString, IsBoolean, IsInt, IsEnum} from "class-validator"
import {ApiProperty} from "@nestjs/swagger"

export class CreateOrderStatusDto {
    @ApiProperty()
    @IsString()
    title: string

    @ApiProperty({enum: ["admin", "manager"]})
    @IsEnum(["admin", "manager"])
    access: "admin" | "manager"

    @ApiProperty()
    @IsBoolean()
    fixed: boolean

    @ApiProperty()
    @IsInt()
    position: number
}

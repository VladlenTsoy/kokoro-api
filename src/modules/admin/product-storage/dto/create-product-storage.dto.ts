import {IsString, IsNumber} from "class-validator"
import {ApiProperty} from "@nestjs/swagger"

export class CreateProductStorageDto {
    @ApiProperty({example: "Основной склад"})
    @IsString()
    title: string

    @ApiProperty({example: 1, description: "ID точки продаж"})
    @IsNumber()
    salesPointId: number
}

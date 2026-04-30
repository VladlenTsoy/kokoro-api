import {ApiProperty} from "@nestjs/swagger"
import {ArrayUnique, IsArray, IsInt} from "class-validator"
import {Type} from "class-transformer"

export class SetOrderStatusTransitionsDto {
    @ApiProperty({example: [2, 3, 6]})
    @IsArray()
    @ArrayUnique()
    @Type(() => Number)
    @IsInt({each: true})
    toStatusIds: number[]
}

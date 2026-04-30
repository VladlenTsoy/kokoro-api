import {ApiProperty} from "@nestjs/swagger"
import {IsInt} from "class-validator"
import {Type} from "class-transformer"

export class MergeClientsDto {
    @ApiProperty({example: 1})
    @Type(() => Number)
    @IsInt()
    sourceClientId: number

    @ApiProperty({example: 2})
    @Type(() => Number)
    @IsInt()
    targetClientId: number
}

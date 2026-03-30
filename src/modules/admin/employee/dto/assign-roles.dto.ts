import {ApiProperty} from "@nestjs/swagger"
import {ArrayNotEmpty, IsArray, IsInt} from "class-validator"

export class AssignRolesDto {
    @ApiProperty({example: [1, 2]})
    @IsArray()
    @ArrayNotEmpty()
    @IsInt({each: true})
    roleIds: number[]
}

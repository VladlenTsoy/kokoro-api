import {ApiProperty} from "@nestjs/swagger"
import {IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength} from "class-validator"

export class CreateRoleDto {
    @ApiProperty({example: "SUPER_ADMIN", description: "Role code"})
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    code: string

    @ApiProperty({example: "Super Admin", description: "Role name"})
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name: string

    @ApiProperty({example: true, required: false})
    @IsBoolean()
    @IsOptional()
    isActive?: boolean
}

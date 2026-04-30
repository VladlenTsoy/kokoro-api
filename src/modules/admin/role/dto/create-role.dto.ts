import {ApiProperty} from "@nestjs/swagger"
import {IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength} from "class-validator"

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

    @ApiProperty({
        example: ["orders.read", "orders.update", "clients.read"],
        required: false,
        description: "Permission codes from GET /admin/roles/permissions"
    })
    @IsArray()
    @IsString({each: true})
    @IsOptional()
    permissions?: string[]
}

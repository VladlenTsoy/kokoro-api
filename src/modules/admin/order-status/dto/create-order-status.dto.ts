import {IsString, IsBoolean, IsInt, IsEnum, IsOptional, IsIn} from "class-validator"
import {ApiProperty} from "@nestjs/swagger"

export class CreateOrderStatusDto {
    @ApiProperty()
    @IsString()
    title: string

    @ApiProperty({required: false, description: "Stable machine code, e.g. pending/preparing/ready/delivered"})
    @IsOptional()
    @IsString()
    code?: string

    @ApiProperty({enum: ["pending", "preparing", "ready", "delivering", "delivered", "cancelled"], required: false})
    @IsOptional()
    @IsIn(["pending", "preparing", "ready", "delivering", "delivered", "cancelled"])
    deliveryStatus?: "pending" | "preparing" | "ready" | "delivering" | "delivered" | "cancelled"

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

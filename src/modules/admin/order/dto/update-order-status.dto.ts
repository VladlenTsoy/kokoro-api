import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger"
import {IsBoolean, IsInt, IsOptional, IsString, MaxLength} from "class-validator"
import {Type} from "class-transformer"

export class UpdateOrderStatusDto {
    @ApiProperty({example: 2})
    @Type(() => Number)
    @IsInt()
    statusId: number

    @ApiPropertyOptional({example: "Confirmed by phone"})
    @IsOptional()
    @IsString()
    @MaxLength(255)
    comment?: string

    @ApiPropertyOptional({default: true})
    @IsOptional()
    @IsBoolean()
    visibleForClient?: boolean
}

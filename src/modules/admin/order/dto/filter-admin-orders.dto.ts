import {ApiPropertyOptional} from "@nestjs/swagger"
import {IsInt, IsOptional, IsString} from "class-validator"
import {Type} from "class-transformer"

export class FilterAdminOrdersDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    statusId?: number

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    paymentMethodId?: number

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    sourceId?: number

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    paymentStatus?: string

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    deliveryStatus?: string

    @ApiPropertyOptional({example: "2026-04-01"})
    @IsOptional()
    @IsString()
    from?: string

    @ApiPropertyOptional({example: "2026-04-30"})
    @IsOptional()
    @IsString()
    to?: string

    @ApiPropertyOptional({default: 1})
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    page?: number

    @ApiPropertyOptional({default: 20})
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    pageSize?: number
}

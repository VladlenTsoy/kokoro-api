import {ApiPropertyOptional} from "@nestjs/swagger"
import {IsBooleanString, IsInt, IsOptional, IsString} from "class-validator"
import {Type} from "class-transformer"

export class FilterAdminClientsDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string

    @ApiPropertyOptional()
    @IsOptional()
    @IsBooleanString()
    isActive?: string

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

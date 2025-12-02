import {IsArray, IsNumber, IsOptional, IsString} from "class-validator"

export class FilterProductVariantDto {
    @IsNumber()
    page: number

    @IsNumber()
    pageSize: number

    @IsOptional()
    @IsString()
    search: string

    @IsOptional()
    @IsArray()
    categoryIds: number[]

    @IsOptional()
    @IsArray()
    sizeIds: number[]

    @IsOptional()
    @IsString()
    statusId: string
}

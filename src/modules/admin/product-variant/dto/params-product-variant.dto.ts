import {IsNumber} from "class-validator"

export class ParamsProductVariantDto {
    @IsNumber()
    page: number

    @IsNumber()
    pageSize: number
}

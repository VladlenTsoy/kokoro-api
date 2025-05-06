import {IsNumber} from "class-validator"

export class ParamsProductColorDto {
    @IsNumber()
    page: number

    @IsNumber()
    pageSize: number
}

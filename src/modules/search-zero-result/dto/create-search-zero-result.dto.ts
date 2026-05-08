import {IsString, MaxLength, MinLength} from "class-validator"

export class CreateSearchZeroResultDto {
    @IsString()
    @MinLength(2)
    @MaxLength(160)
    query: string
}

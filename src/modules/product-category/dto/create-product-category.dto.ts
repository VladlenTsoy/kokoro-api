import {IsBoolean, IsOptional, IsInt, IsNotEmpty, IsString} from "class-validator"
import {ApiProperty} from "@nestjs/swagger"

export class CreateProductCategoryDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({example: "Product category title", description: "The title of the product category", required: true})
    readonly title: string;

    @IsInt()
    @IsOptional()
    @ApiProperty({example: 1, description: "The parent category id of the product category", required: false})
    readonly parent_category_id: number;

    @IsBoolean()
    @IsOptional()
    @ApiProperty({example: true, description: "The hide of the product category", required: false})
    readonly is_hide: boolean;
}

import {CreateProductVariantSizeDto} from "./create-product-variant-size.dto"
import {PartialType} from "@nestjs/swagger"

export class UpdateProductVariantSizeDto extends PartialType(CreateProductVariantSizeDto) {}

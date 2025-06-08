import {PartialType} from "@nestjs/swagger"
import {CreateProductVariantDiscountDto} from "./create-product-variant-discount.dto"

export class UpdateProductVariantDiscountDto extends PartialType(CreateProductVariantDiscountDto) {}

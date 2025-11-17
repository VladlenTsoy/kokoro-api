import {PartialType} from "@nestjs/swagger"
import {CreateProductVariantStatusDto} from "./create-product-variant-status.dto"

export class UpdateProductVariantStatusDto extends PartialType(CreateProductVariantStatusDto) {}

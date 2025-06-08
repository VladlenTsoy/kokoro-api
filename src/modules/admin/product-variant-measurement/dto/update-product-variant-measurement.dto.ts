import {PartialType} from "@nestjs/swagger"
import {CreateProductVariantMeasurementDto} from "./create-product-variant-measurement.dto"

export class UpdateProductVariantMeasurementDto extends PartialType(CreateProductVariantMeasurementDto) {}

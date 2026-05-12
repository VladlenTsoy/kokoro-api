import {PartialType} from "@nestjs/swagger"
import {CreateProductBarcodeDto} from "./create-product-barcode.dto"

export class UpdateProductBarcodeDto extends PartialType(CreateProductBarcodeDto) {}

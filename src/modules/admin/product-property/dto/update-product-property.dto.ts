import { PartialType } from '@nestjs/swagger';
import { CreateProductPropertyDto } from './create-product-property.dto';

export class UpdateProductPropertyDto extends PartialType(CreateProductPropertyDto) {}

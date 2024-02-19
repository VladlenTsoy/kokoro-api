import { PartialType } from '@nestjs/swagger';
import { CreateProductColorTagDto } from './create-product-color-tag.dto';

export class UpdateProductColorTagDto extends PartialType(CreateProductColorTagDto) {}

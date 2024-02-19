import { Injectable } from '@nestjs/common';
import { CreateProductColorTagDto } from './dto/create-product-color-tag.dto';
import { UpdateProductColorTagDto } from './dto/update-product-color-tag.dto';

@Injectable()
export class ProductColorTagService {
  create(createProductColorTagDto: CreateProductColorTagDto) {
    return 'This action adds a new productColorTag';
  }

  findAll() {
    return `This action returns all productColorTag`;
  }

  findOne(id: number) {
    return `This action returns a #${id} productColorTag`;
  }

  update(id: number, updateProductColorTagDto: UpdateProductColorTagDto) {
    return `This action updates a #${id} productColorTag`;
  }

  remove(id: number) {
    return `This action removes a #${id} productColorTag`;
  }
}

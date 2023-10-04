import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductColorTagService } from './product-color-tag.service';
import { CreateProductColorTagDto } from './dto/create-product-color-tag.dto';
import { UpdateProductColorTagDto } from './dto/update-product-color-tag.dto';

@Controller('product-color-tag')
export class ProductColorTagController {
  constructor(private readonly productColorTagService: ProductColorTagService) {}

  @Post()
  create(@Body() createProductColorTagDto: CreateProductColorTagDto) {
    return this.productColorTagService.create(createProductColorTagDto);
  }

  @Get()
  findAll() {
    return this.productColorTagService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productColorTagService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductColorTagDto: UpdateProductColorTagDto) {
    return this.productColorTagService.update(+id, updateProductColorTagDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productColorTagService.remove(+id);
  }
}

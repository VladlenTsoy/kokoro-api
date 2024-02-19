import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductColorService } from './product-color.service';
import { CreateProductColorDto } from './dto/create-product-color.dto';
import { UpdateProductColorDto } from './dto/update-product-color.dto';

@Controller('product-color')
export class ProductColorController {
  constructor(private readonly productColorService: ProductColorService) {}

  @Post()
  create(@Body() createProductColorDto: CreateProductColorDto) {
    return this.productColorService.create(createProductColorDto);
  }

  @Get()
  findAll() {
    return this.productColorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productColorService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductColorDto: UpdateProductColorDto) {
    return this.productColorService.update(+id, updateProductColorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productColorService.remove(+id);
  }
}

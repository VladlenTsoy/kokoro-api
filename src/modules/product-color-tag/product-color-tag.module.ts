import { Module } from '@nestjs/common';
import { ProductColorTagService } from './product-color-tag.service';
import { ProductColorTagController } from './product-color-tag.controller';

@Module({
  controllers: [ProductColorTagController],
  providers: [ProductColorTagService],
})
export class ProductColorTagModule {}

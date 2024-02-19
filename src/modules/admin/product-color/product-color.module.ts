import { Module } from '@nestjs/common';
import { ProductColorService } from './product-color.service';
import { ProductColorController } from './product-color.controller';

@Module({
  controllers: [ProductColorController],
  providers: [ProductColorService],
})
export class ProductColorModule {}

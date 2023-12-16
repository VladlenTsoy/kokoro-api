import { Module } from '@nestjs/common';
import { ProductCategoryService } from './product-category.service';
import { ProductCategoryController } from './product-category.controller';
import {TypeOrmModule} from "@nestjs/typeorm"
import {ProductCategoryEntity} from "./entities/product-category.entity"

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductCategoryEntity]),
  ],
  controllers: [ProductCategoryController],
  providers: [ProductCategoryService],
})
export class ProductCategoryModule {}

import { Test, TestingModule } from '@nestjs/testing';
import { ProductCategoryController } from './product-category.controller';
import { ProductCategoryService } from './product-category.service';
import {Repository} from "typeorm"
import {getRepositoryToken} from "@nestjs/typeorm"
import {ProductCategoryEntity} from "./entities/product-category.entity"

describe('ProductCategoryController', () => {
  let controller: ProductCategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductCategoryController],
      providers: [
        ProductCategoryService,
        {
          provide: getRepositoryToken(ProductCategoryEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    controller = module.get<ProductCategoryController>(ProductCategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

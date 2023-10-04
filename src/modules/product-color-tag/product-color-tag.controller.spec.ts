import { Test, TestingModule } from '@nestjs/testing';
import { ProductColorTagController } from './product-color-tag.controller';
import { ProductColorTagService } from './product-color-tag.service';

describe('ProductColorTagController', () => {
  let controller: ProductColorTagController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductColorTagController],
      providers: [ProductColorTagService],
    }).compile();

    controller = module.get<ProductColorTagController>(ProductColorTagController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

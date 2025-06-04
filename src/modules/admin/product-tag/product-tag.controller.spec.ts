import { Test, TestingModule } from '@nestjs/testing';
import { ProductTagController } from './product-tag.controller';
import { ProductTagService } from './product-tag.service';

describe('ProductColorTagController', () => {
  let controller: ProductTagController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductTagController],
      providers: [ProductTagService],
    }).compile();

    controller = module.get<ProductTagController>(ProductTagController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

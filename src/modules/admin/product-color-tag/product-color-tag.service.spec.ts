import { Test, TestingModule } from '@nestjs/testing';
import { ProductColorTagService } from './product-color-tag.service';

describe('ProductColorTagService', () => {
  let service: ProductColorTagService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductColorTagService],
    }).compile();

    service = module.get<ProductColorTagService>(ProductColorTagService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

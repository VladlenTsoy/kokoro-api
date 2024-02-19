import { Test, TestingModule } from '@nestjs/testing';
import { ProductColorService } from './product-color.service';

describe('ProductColorService', () => {
  let service: ProductColorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductColorService],
    }).compile();

    service = module.get<ProductColorService>(ProductColorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

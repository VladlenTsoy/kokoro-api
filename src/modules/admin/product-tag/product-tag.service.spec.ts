import { Test, TestingModule } from '@nestjs/testing';
import { ProductTagService } from './product-tag.service';

describe('ProductColorTagService', () => {
  let service: ProductTagService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductTagService],
    }).compile();

    service = module.get<ProductTagService>(ProductTagService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

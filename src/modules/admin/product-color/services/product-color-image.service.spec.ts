import { Test, TestingModule } from '@nestjs/testing';
import { ProductColorImageService } from './product-color-image.service';

describe('ProductColorImageService', () => {
  let service: ProductColorImageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductColorImageService],
    }).compile();

    service = module.get<ProductColorImageService>(ProductColorImageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

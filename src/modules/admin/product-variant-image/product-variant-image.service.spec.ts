import {Test, TestingModule} from "@nestjs/testing"
import {ProductVariantImageService} from "./product-variant-image.service"

describe("ProductColorImageService", () => {
    let service: ProductVariantImageService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ProductVariantImageService]
        }).compile()

        service = module.get<ProductVariantImageService>(ProductVariantImageService)
    })

    it("should be defined", () => {
        expect(service).toBeDefined()
    })
})

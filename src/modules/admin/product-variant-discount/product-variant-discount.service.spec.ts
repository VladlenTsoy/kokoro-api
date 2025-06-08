import {Test, TestingModule} from "@nestjs/testing"
import {ProductVariantDiscountService} from "./product-variant-discount.service"

describe("ProductVariantDiscountService", () => {
    let service: ProductVariantDiscountService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ProductVariantDiscountService]
        }).compile()

        service = module.get<ProductVariantDiscountService>(ProductVariantDiscountService)
    })

    it("should be defined", () => {
        expect(service).toBeDefined()
    })
})

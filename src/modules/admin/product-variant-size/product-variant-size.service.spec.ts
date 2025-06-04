import {Test, TestingModule} from "@nestjs/testing"
import {ProductVariantSizeService} from "./product-variant-size.service"

describe("ProductVariantSizeService", () => {
    let service: ProductVariantSizeService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ProductVariantSizeService]
        }).compile()

        service = module.get<ProductVariantSizeService>(ProductVariantSizeService)
    })

    it("should be defined", () => {
        expect(service).toBeDefined()
    })
})

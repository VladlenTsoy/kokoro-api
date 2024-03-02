import {Test, TestingModule} from "@nestjs/testing"
import {ProductColorSizeService} from "./product-color-size.service"

describe("ProductSizeService", () => {
    let service: ProductColorSizeService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ProductColorSizeService]
        }).compile()

        service = module.get<ProductColorSizeService>(ProductColorSizeService)
    })

    it("should be defined", () => {
        expect(service).toBeDefined()
    })
})

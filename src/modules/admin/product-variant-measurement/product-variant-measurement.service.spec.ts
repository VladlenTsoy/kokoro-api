import {Test, TestingModule} from "@nestjs/testing"
import {ProductVariantMeasurementService} from "./product-variant-measurement.service"

describe("ProductVariantMeasurementService", () => {
    let service: ProductVariantMeasurementService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ProductVariantMeasurementService]
        }).compile()

        service = module.get<ProductVariantMeasurementService>(ProductVariantMeasurementService)
    })

    it("should be defined", () => {
        expect(service).toBeDefined()
    })
})

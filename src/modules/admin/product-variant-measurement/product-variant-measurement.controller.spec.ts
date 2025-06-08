import {Test, TestingModule} from "@nestjs/testing"
import {ProductVariantMeasurementController} from "./product-variant-measurement.controller"
import {ProductVariantMeasurementService} from "./product-variant-measurement.service"

describe("ProductVariantMeasurementController", () => {
    let controller: ProductVariantMeasurementController

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProductVariantMeasurementController],
            providers: [ProductVariantMeasurementService]
        }).compile()

        controller = module.get<ProductVariantMeasurementController>(ProductVariantMeasurementController)
    })

    it("should be defined", () => {
        expect(controller).toBeDefined()
    })
})

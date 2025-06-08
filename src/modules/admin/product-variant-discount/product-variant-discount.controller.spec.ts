import {Test, TestingModule} from "@nestjs/testing"
import {ProductVariantDiscountController} from "./product-variant-discount.controller"
import {ProductVariantDiscountService} from "./product-variant-discount.service"

describe("ProductVariantDiscountController", () => {
    let controller: ProductVariantDiscountController

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProductVariantDiscountController],
            providers: [ProductVariantDiscountService]
        }).compile()

        controller = module.get<ProductVariantDiscountController>(ProductVariantDiscountController)
    })

    it("should be defined", () => {
        expect(controller).toBeDefined()
    })
})

import {Test, TestingModule} from "@nestjs/testing"
import {ProductCategoryService} from "./product-category.service"
import {TypeOrmModule} from "@nestjs/typeorm"
import {ProductCategoryEntity} from "./entities/product-category.entity"

describe("ProductCategoryService", () => {
    let service: ProductCategoryService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [TypeOrmModule.forFeature([ProductCategoryEntity])],
            providers: [ProductCategoryService]
        }).compile()

        service = module.get<ProductCategoryService>(ProductCategoryService)
    })

    it("should be defined", () => {
        expect(service).toBeDefined()
    })
})

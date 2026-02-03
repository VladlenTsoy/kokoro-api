import {Test, TestingModule} from "@nestjs/testing"
import {ClientProductVariantController} from "./product-variant.controller"
import {ClientProductVariantService} from "./product-variant.service"

describe("ClientProductVariantController", () => {
    let controller: ClientProductVariantController
    let service: ClientProductVariantService

    const serviceMock = {
        findAll: jest.fn(),
        findOne: jest.fn()
    } as unknown as ClientProductVariantService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ClientProductVariantController],
            providers: [
                {
                    provide: ClientProductVariantService,
                    useValue: serviceMock
                }
            ]
        }).compile()

        controller = module.get(ClientProductVariantController)
        service = module.get(ClientProductVariantService)
    })

    it("passes pagination params to service", async () => {
        ;(serviceMock.findAll as jest.Mock).mockResolvedValue({items: [], total: 0})

        await controller.findAll("2", "15")

        expect(serviceMock.findAll).toHaveBeenCalledWith({page: 2, pageSize: 15})
    })

    it("passes id to service", async () => {
        ;(serviceMock.findOne as jest.Mock).mockResolvedValue({id: 1})

        await controller.findOne("1")

        expect(serviceMock.findOne).toHaveBeenCalledWith(1)
    })
})

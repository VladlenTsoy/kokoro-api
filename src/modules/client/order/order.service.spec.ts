import {BadRequestException, ForbiddenException, NotFoundException} from "@nestjs/common"
import {OrderDeliveryStatus} from "../../admin/order/entities/order.entity"
import {ClientOrderService} from "./order.service"

describe("ClientOrderService access guards", () => {
    const buildService = () => {
        const orderRepository = {
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            save: jest.fn()
        }
        const historyRepository = {
            create: jest.fn((value) => value),
            save: jest.fn()
        }
        const dataSource = {
            getRepository: jest.fn()
        }

        return {
            service: new ClientOrderService(dataSource as any, orderRepository as any, historyRepository as any),
            orderRepository,
            historyRepository,
            dataSource
        }
    }

    it("does not expose an order without owner token or guest access token", async () => {
        const {service, orderRepository} = buildService()
        orderRepository.findOne.mockResolvedValue({
            id: 1,
            client: {id: 10},
            accessToken: "guest-token",
            items: [],
            histories: []
        })

        await expect(service.findOneForClient(1, 11, "wrong-token")).rejects.toBeInstanceOf(ForbiddenException)
    })

    it("allows guest access token to read an order", async () => {
        const {service, orderRepository} = buildService()
        orderRepository.findOne.mockResolvedValue({
            id: 1,
            total: 1000,
            subtotal: 1000,
            discountTotal: 0,
            deliveryPrice: 0,
            paymentStatus: "pending",
            deliveryStatus: "pending",
            client: null,
            clientName: "Guest",
            phone: "+998901234567",
            accessToken: "guest-token",
            items: [],
            histories: []
        })

        const response = await service.findOneForClient(1, undefined, "guest-token")

        expect(response.id).toBe(1)
        expect(response.client).toEqual({name: "Guest", phone: "+998901234567"})
    })

    it("rejects cancellation for missing or already processed orders", async () => {
        const {service, orderRepository} = buildService()

        orderRepository.findOne.mockResolvedValueOnce(null)
        await expect(service.cancelForClient(1, 10, undefined)).rejects.toBeInstanceOf(NotFoundException)

        orderRepository.findOne.mockResolvedValueOnce({
            id: 1,
            client: {id: 10},
            deliveryStatus: OrderDeliveryStatus.DELIVERED,
            accessToken: null
        })
        await expect(service.cancelForClient(1, 10, undefined)).rejects.toBeInstanceOf(BadRequestException)
    })
})

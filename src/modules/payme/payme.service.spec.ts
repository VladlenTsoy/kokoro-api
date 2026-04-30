import {BadRequestException, ForbiddenException, NotFoundException} from "@nestjs/common"
import {OrderPaymentStatus, OrderEntity} from "../admin/order/entities/order.entity"
import {PaymeService} from "./payme.service"
import {PaymeTransactionState} from "./entities/payme-transaction.entity"

describe("PaymeService", () => {
    const authHeader = `Basic ${Buffer.from("Paycom:test-key").toString("base64")}`

    const configService = {
        get: jest.fn((key: string, defaultValue?: any) => {
            const values = {
                PAYME_ACCOUNT_FIELD: "order_id",
                PAYME_MERCHANT_ID: "merchant-123",
                PAYME_CHECKOUT_URL: "https://checkout.paycom.uz",
                PAYME_RETURN_URL: "https://kokoro.uz/orders",
                PAYME_CALLBACK_TIMEOUT_MS: 15000,
                PAYME_LOGIN: "Paycom",
                PAYME_KEY: "test-key"
            }

            return values[key] ?? defaultValue
        })
    }

    const createOrder = (overrides: Partial<OrderEntity> = {}) =>
        Object.assign(new OrderEntity(), {
            id: 10,
            orderNumber: "KO-000010",
            total: 150000,
            paymentStatus: OrderPaymentStatus.PENDING,
            accessToken: "guest-token",
            client: {id: 5},
            ...overrides
        })

    const buildService = () => {
        const orderRepository = {
            findOne: jest.fn(),
            save: jest.fn(async (value) => value)
        }
        const transactionRepository = {
            findOne: jest.fn(),
            create: jest.fn((value) => ({id: 99, ...value})),
            save: jest.fn(async (value) => value),
            createQueryBuilder: jest.fn()
        }

        return {
            service: new PaymeService(configService as any, orderRepository as any, transactionRepository as any),
            orderRepository,
            transactionRepository
        }
    }

    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(Date, "now").mockReturnValue(1_700_000_000_000)
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it("rejects callback requests with invalid authorization", async () => {
        const {service} = buildService()

        const response = await service.handleRpc({id: 1, method: "CheckPerformTransaction"}, "Basic wrong")

        expect(response).toEqual({
            id: 1,
            error: {
                code: -32504,
                message: "Insufficient privileges",
                data: undefined
            },
            result: null
        })
    })

    it("builds a Payme checkout link only for order owner or guest access token", async () => {
        const {service, orderRepository} = buildService()
        orderRepository.findOne.mockResolvedValue(createOrder())

        const response = await service.buildPaymentLink(10, undefined, 5, "uz")
        const encodedPayload = response.paymentUrl.split("/").pop()
        const decodedPayload = Buffer.from(encodedPayload, "base64").toString("utf8")

        expect(response.amount).toBe(15_000_000)
        expect(decodedPayload).toContain("m=merchant-123")
        expect(decodedPayload).toContain("ac.order_id=10")
        expect(decodedPayload).toContain("a=15000000")
        expect(decodedPayload).toContain("l=uz")
    })

    it("blocks Payme links for missing, foreign, or already paid orders", async () => {
        const {service, orderRepository} = buildService()

        orderRepository.findOne.mockResolvedValueOnce(null)
        await expect(service.buildPaymentLink(10, undefined, 5)).rejects.toBeInstanceOf(NotFoundException)

        orderRepository.findOne.mockResolvedValueOnce(createOrder({client: {id: 7} as any, accessToken: "guest-token"}))
        await expect(service.buildPaymentLink(10, "wrong-token", 5)).rejects.toBeInstanceOf(ForbiddenException)

        orderRepository.findOne.mockResolvedValueOnce(createOrder({paymentStatus: OrderPaymentStatus.PAID}))
        await expect(service.buildPaymentLink(10, undefined, 5)).rejects.toBeInstanceOf(BadRequestException)
    })

    it("creates and performs a Payme transaction, marking the order as paid", async () => {
        const {service, orderRepository, transactionRepository} = buildService()
        const order = createOrder()

        transactionRepository.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null)
        orderRepository.findOne.mockResolvedValue(order)

        const createResponse = await service.handleRpc(
            {
                id: 1,
                method: "CreateTransaction",
                params: {
                    id: "payme-tx-1",
                    time: Date.now(),
                    amount: 15_000_000,
                    account: {order_id: 10}
                }
            },
            authHeader
        )

        expect(createResponse.error).toBeNull()
        expect(createResponse.result.state).toBe(PaymeTransactionState.CREATED)

        const createdTransaction = transactionRepository.save.mock.calls[0][0]
        transactionRepository.findOne.mockResolvedValueOnce(createdTransaction)

        const performResponse = await service.handleRpc(
            {
                id: 2,
                method: "PerformTransaction",
                params: {id: "payme-tx-1"}
            },
            authHeader
        )

        expect(performResponse.error).toBeNull()
        expect(createdTransaction.state).toBe(PaymeTransactionState.PERFORMED)
        expect(createdTransaction.order.paymentStatus).toBe(OrderPaymentStatus.PAID)
        expect(orderRepository.save).toHaveBeenCalledWith(createdTransaction.order)
    })

    it("rejects wrong amounts before creating a transaction", async () => {
        const {service, orderRepository, transactionRepository} = buildService()
        orderRepository.findOne.mockResolvedValue(createOrder())
        transactionRepository.findOne.mockResolvedValue(null)

        const response = await service.handleRpc(
            {
                id: 1,
                method: "CreateTransaction",
                params: {
                    id: "payme-tx-1",
                    time: Date.now(),
                    amount: 12_000_000,
                    account: {order_id: 10}
                }
            },
            authHeader
        )

        expect(response.error.code).toBe(-31001)
        expect(transactionRepository.save).not.toHaveBeenCalled()
    })
})

import {BadRequestException, ForbiddenException, Injectable, NotFoundException} from "@nestjs/common"
import {ConfigService} from "@nestjs/config"
import {InjectRepository} from "@nestjs/typeorm"
import {In, Repository} from "typeorm"
import {OrderPaymentStatus, OrderEntity} from "../admin/order/entities/order.entity"
import {PaymeTransactionEntity, PaymeTransactionState} from "./entities/payme-transaction.entity"

type PaymeRpcRequest = {
    id: number
    method: string
    params?: any
}

@Injectable()
export class PaymeService {
    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(OrderEntity)
        private readonly orderRepository: Repository<OrderEntity>,
        @InjectRepository(PaymeTransactionEntity)
        private readonly transactionRepository: Repository<PaymeTransactionEntity>
    ) {}

    private readonly transactionTimeoutMs = 12 * 60 * 60 * 1000

    private error(code: number, message: string, data?: any) {
        return {
            error: {
                code,
                message,
                data
            },
            result: null
        }
    }

    private result(result: Record<string, any>) {
        return {error: null, result}
    }

    private nowMs() {
        return Date.now()
    }

    private getAccountField() {
        return this.configService.get<string>("PAYME_ACCOUNT_FIELD", "order_id")
    }

    private getMerchantId() {
        return this.configService.get<string>("PAYME_MERCHANT_ID", "")
    }

    private getCheckoutUrl() {
        return this.configService.get<string>("PAYME_CHECKOUT_URL", "https://checkout.paycom.uz")
    }

    private getReturnUrl() {
        return this.configService.get<string>("PAYME_RETURN_URL", "")
    }

    private getCallbackTimeout() {
        return Number(this.configService.get("PAYME_CALLBACK_TIMEOUT_MS", 15000))
    }

    private getExpectedAuthHeader() {
        const login = this.configService.get<string>("PAYME_LOGIN", "Paycom")
        const key = this.configService.get<string>("PAYME_KEY")
        if (!key) return null

        return `Basic ${Buffer.from(`${login}:${key}`).toString("base64")}`
    }

    private isAuthorized(authHeader?: string) {
        const expected = this.getExpectedAuthHeader()
        if (!expected) return false
        return authHeader === expected
    }

    private extractOrderId(account: Record<string, any> = {}) {
        const raw = account[this.getAccountField()]
        const orderId = Number(raw)
        return Number.isInteger(orderId) && orderId > 0 ? orderId : null
    }

    private toPaymeAmount(order: OrderEntity) {
        return Number(order.total || 0) * 100
    }

    private serializeTransaction(transaction: PaymeTransactionEntity) {
        return {
            create_time: Number(transaction.createTime),
            perform_time: Number(transaction.performTime || 0),
            cancel_time: Number(transaction.cancelTime || 0),
            transaction: String(transaction.id),
            state: Number(transaction.state),
            reason: transaction.reason ?? null
        }
    }

    private async getOrderForPayment(account: Record<string, any>, amount: number) {
        const orderId = this.extractOrderId(account)
        if (!orderId) return this.error(-31050, "Order not found", this.getAccountField())

        const order = await this.orderRepository.findOne({where: {id: orderId}})
        if (!order) return this.error(-31050, "Order not found", this.getAccountField())
        if (this.toPaymeAmount(order) !== Number(amount)) return this.error(-31001, "Invalid amount", "amount")
        if (order.paymentStatus === OrderPaymentStatus.PAID) {
            return this.error(-31008, "Order is already paid", this.getAccountField())
        }

        return order
    }

    async buildPaymentLink(orderId: number, accessToken?: string, clientId?: number, lang = "ru") {
        const order = await this.orderRepository.findOne({
            where: {id: orderId},
            relations: {client: true}
        })
        if (!order) throw new NotFoundException("Order not found")

        const isOwner = clientId && order.client?.id === clientId
        const isGuestWithToken = accessToken && order.accessToken && accessToken === order.accessToken
        if (!isOwner && !isGuestWithToken) throw new ForbiddenException("Order is not available")
        if (order.paymentStatus === OrderPaymentStatus.PAID) throw new BadRequestException("Order is already paid")
        if (!this.getMerchantId()) throw new BadRequestException("Payme merchant id is not configured")

        const accountField = this.getAccountField()
        const params = [
            `m=${this.getMerchantId()}`,
            `ac.${accountField}=${order.id}`,
            `a=${this.toPaymeAmount(order)}`,
            `l=${lang}`
        ]
        const returnUrl = this.getReturnUrl()
        if (returnUrl) params.push(`c=${encodeURIComponent(returnUrl)}`)
        const callbackTimeout = this.getCallbackTimeout()
        if (callbackTimeout > 0) params.push(`ct=${callbackTimeout}`)

        const encoded = Buffer.from(params.join(";")).toString("base64")
        const paymentUrl = `${this.getCheckoutUrl().replace(/\/$/, "")}/${encoded}`

        return {
            paymentUrl,
            merchantId: this.getMerchantId(),
            amount: this.toPaymeAmount(order),
            orderId: order.id,
            orderNumber: order.orderNumber,
            account: {
                [accountField]: order.id
            }
        }
    }

    async handleRpc(request: PaymeRpcRequest, authHeader?: string) {
        if (!this.isAuthorized(authHeader)) {
            return {id: request?.id ?? null, ...this.error(-32504, "Insufficient privileges")}
        }

        if (!request?.method) {
            return {id: request?.id ?? null, ...this.error(-32600, "Invalid request")}
        }

        const response = await this.dispatch(request)
        return {id: request.id, ...response}
    }

    private async dispatch(request: PaymeRpcRequest) {
        switch (request.method) {
            case "CheckPerformTransaction":
                return this.checkPerformTransaction(request.params)
            case "CreateTransaction":
                return this.createTransaction(request.params)
            case "PerformTransaction":
                return this.performTransaction(request.params)
            case "CancelTransaction":
                return this.cancelTransaction(request.params)
            case "CheckTransaction":
                return this.checkTransaction(request.params)
            case "GetStatement":
                return this.getStatement(request.params)
            default:
                return this.error(-32601, "Method not found")
        }
    }

    private async checkPerformTransaction(params: any) {
        const orderOrError = await this.getOrderForPayment(params?.account, params?.amount)
        if (!(orderOrError instanceof OrderEntity)) return orderOrError
        return this.result({allow: true})
    }

    private async createTransaction(params: any) {
        const existing = await this.transactionRepository.findOne({
            where: {paymeId: params?.id},
            relations: {order: true}
        })
        if (existing) {
            if (existing.amount !== Number(params?.amount)) return this.error(-31001, "Invalid amount", "amount")
            return this.result(this.serializeTransaction(existing))
        }

        const orderOrError = await this.getOrderForPayment(params?.account, params?.amount)
        if (!(orderOrError instanceof OrderEntity)) return orderOrError
        const order = orderOrError

        const activeTransaction = await this.transactionRepository.findOne({
            where: {
                order: {id: order.id},
                state: In([PaymeTransactionState.CREATED, PaymeTransactionState.PERFORMED])
            }
        })
        if (activeTransaction) return this.error(-31008, "Transaction is already active", this.getAccountField())

        if (this.nowMs() - Number(params?.time || 0) > this.transactionTimeoutMs) {
            return this.error(-31008, "Transaction timeout", "time")
        }

        const transaction = this.transactionRepository.create({
            paymeId: params.id,
            order,
            amount: Number(params.amount),
            state: PaymeTransactionState.CREATED,
            createTime: Number(params.time),
            performTime: 0,
            cancelTime: 0,
            reason: null
        })
        const saved = await this.transactionRepository.save(transaction)

        return this.result(this.serializeTransaction(saved))
    }

    private async performTransaction(params: any) {
        const transaction = await this.transactionRepository.findOne({
            where: {paymeId: params?.id},
            relations: {order: true}
        })
        if (!transaction) return this.error(-31003, "Transaction not found", "transaction")

        if (transaction.state === PaymeTransactionState.PERFORMED) {
            return this.result(this.serializeTransaction(transaction))
        }
        if (transaction.state !== PaymeTransactionState.CREATED) {
            return this.error(-31008, "Unable to perform transaction", "transaction")
        }

        transaction.state = PaymeTransactionState.PERFORMED
        transaction.performTime = this.nowMs()
        await this.transactionRepository.save(transaction)

        transaction.order.paymentStatus = OrderPaymentStatus.PAID
        await this.orderRepository.save(transaction.order)

        return this.result(this.serializeTransaction(transaction))
    }

    private async cancelTransaction(params: any) {
        const transaction = await this.transactionRepository.findOne({
            where: {paymeId: params?.id},
            relations: {order: true}
        })
        if (!transaction) return this.error(-31003, "Transaction not found", "transaction")

        if (
            [PaymeTransactionState.CANCELLED, PaymeTransactionState.CANCELLED_AFTER_PERFORM].includes(transaction.state)
        ) {
            return this.result(this.serializeTransaction(transaction))
        }

        transaction.reason = Number(params?.reason || 0)
        transaction.cancelTime = this.nowMs()
        transaction.state =
            transaction.state === PaymeTransactionState.PERFORMED
                ? PaymeTransactionState.CANCELLED_AFTER_PERFORM
                : PaymeTransactionState.CANCELLED
        await this.transactionRepository.save(transaction)

        transaction.order.paymentStatus =
            transaction.state === PaymeTransactionState.CANCELLED_AFTER_PERFORM
                ? OrderPaymentStatus.REFUNDED
                : OrderPaymentStatus.FAILED
        await this.orderRepository.save(transaction.order)

        return this.result(this.serializeTransaction(transaction))
    }

    private async checkTransaction(params: any) {
        const transaction = await this.transactionRepository.findOne({where: {paymeId: params?.id}})
        if (!transaction) return this.error(-31003, "Transaction not found", "transaction")
        return this.result(this.serializeTransaction(transaction))
    }

    private async getStatement(params: any) {
        const from = Number(params?.from || 0)
        const to = Number(params?.to || this.nowMs())
        const transactions = await this.transactionRepository
            .createQueryBuilder("transaction")
            .where("transaction.createTime >= :from", {from})
            .andWhere("transaction.createTime <= :to", {to})
            .orderBy("transaction.createTime", "ASC")
            .getMany()

        return this.result({
            transactions: transactions.map((transaction) => this.serializeTransaction(transaction))
        })
    }
}

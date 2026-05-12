import {BadRequestException, Injectable, NotFoundException} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {EmployeeEntity} from "../employee/entities/employee.entity"
import {SalesPointEntity} from "../sales-point/entities/sales-point.entity"
import {OrderEntity} from "../order/entities/order.entity"
import {ProductVariantEntity} from "../product-variant/entities/product-variant.entity"
import {ProductBarcodeEntity} from "../product-barcode/entities/product-barcode.entity"
import {PosDeviceEntity} from "./entities/pos-device.entity"
import {PosShiftEntity, PosShiftStatus} from "./entities/pos-shift.entity"
import {PosShiftEventEntity, PosShiftEventType} from "./entities/pos-shift-event.entity"
import {OpenPosShiftDto} from "./dto/open-pos-shift.dto"
import {ClosePosShiftDto} from "./dto/close-pos-shift.dto"
import {AdminAuthenticatedUser} from "../auth/types/admin-authenticated-user.type"

@Injectable()
export class PosService {
    constructor(
        @InjectRepository(PosShiftEntity)
        private readonly shiftRepo: Repository<PosShiftEntity>,
        @InjectRepository(PosDeviceEntity)
        private readonly deviceRepo: Repository<PosDeviceEntity>,
        @InjectRepository(PosShiftEventEntity)
        private readonly eventRepo: Repository<PosShiftEventEntity>,
        @InjectRepository(EmployeeEntity)
        private readonly employeeRepo: Repository<EmployeeEntity>,
        @InjectRepository(SalesPointEntity)
        private readonly salesPointRepo: Repository<SalesPointEntity>,
        @InjectRepository(OrderEntity)
        private readonly orderRepo: Repository<OrderEntity>,
        @InjectRepository(ProductVariantEntity)
        private readonly productVariantRepo: Repository<ProductVariantEntity>,
        @InjectRepository(ProductBarcodeEntity)
        private readonly barcodeRepo: Repository<ProductBarcodeEntity>
    ) {}

    async getSession(admin: AdminAuthenticatedUser) {
        const employee = await this.employeeRepo.findOne({where: {id: admin.id}, relations: {roles: true}})
        if (!employee || !employee.isActive) throw new BadRequestException("Employee is not active")

        const activeShift = await this.shiftRepo.findOne({
            where: {employee: {id: employee.id}, status: PosShiftStatus.OPEN},
            relations: {salesPoint: true, device: true},
            order: {openedAt: "DESC"}
        })
        const isPosManager = admin.permissions.includes("pos.manage") || admin.permissions.includes("pos.manager")
        const salesPoints = isPosManager
            ? await this.salesPointRepo.find({order: {id: "ASC"}})
            : employee.salesPoints || []

        return {
            employee: {
                id: employee.id,
                email: employee.email,
                firstName: employee.firstName,
                lastName: employee.lastName
            },
            permissions: admin.permissions,
            salesPoints,
            activeShift
        }
    }

    async getCatalog(admin: AdminAuthenticatedUser, search?: string) {
        const session = await this.getSession(admin)
        const activeShift = session.activeShift
        if (!activeShift) throw new BadRequestException("Open POS shift is required")

        const query = this.productVariantRepo
            .createQueryBuilder("variant")
            .leftJoinAndSelect("variant.product", "product")
            .leftJoinAndSelect("variant.color", "color")
            .leftJoinAndSelect("variant.discount", "discount")
            .leftJoinAndSelect("variant.images", "images")
            .leftJoinAndSelect("variant.sizes", "sizes")
            .leftJoinAndSelect("sizes.size", "size")
            .leftJoinAndSelect("variant.storage", "storage")
            .leftJoinAndSelect("storage.salesPoint", "salesPoint")
            .where("salesPoint.id = :salesPointId", {salesPointId: activeShift.salesPoint.id})
            .andWhere("variant.status_id = :activeStatusId", {activeStatusId: 2})
            .orderBy("variant.id", "DESC")
            .take(80)

        if (search?.trim()) {
            query.andWhere("(variant.title LIKE :search)", {search: `%${search.trim()}%`})
        }

        const items = await query.getMany()
        return items.map((variant) => ({
            id: variant.id,
            title: variant.title,
            price: variant.price,
            color: variant.color,
            images: variant.images,
            storage: variant.storage,
            availableQty:
                variant.qty === null || variant.qty === undefined
                    ? null
                    : Math.max(Number(variant.qty || 0) - Number(variant.reservedQty || 0), 0),
            sizes: (variant.sizes || []).map((item) => ({
                id: item.id,
                size: item.size,
                qty: item.qty,
                reservedQty: item.reservedQty,
                soldQty: item.soldQty,
                availableQty: Math.max(Number(item.qty || 0) - Number(item.reservedQty || 0), 0)
            }))
        }))
    }

    async findProductByBarcode(admin: AdminAuthenticatedUser, code: string) {
        const session = await this.getSession(admin)
        const activeShift = session.activeShift
        if (!activeShift) throw new BadRequestException("Open POS shift is required")

        const barcode = await this.barcodeRepo.findOne({
            where: {code: code.trim(), isActive: true},
            relations: {
                productVariant: {product: true, color: true, discount: true, images: true, sizes: {size: true}, storage: {salesPoint: true}},
                productVariantSize: {size: true}
            }
        })
        if (!barcode) throw new NotFoundException("Barcode not found")
        if (barcode.productVariant.storage?.salesPoint?.id !== activeShift.salesPoint.id) {
            throw new BadRequestException("Scanned product is not available in current sales point")
        }

        const variant = barcode.productVariant
        const selectedSize = barcode.productVariantSize || null
        return {
            barcode: {id: barcode.id, code: barcode.code, type: barcode.type},
            productVariant: {
                id: variant.id,
                title: variant.title,
                price: variant.price,
                color: variant.color,
                images: variant.images,
                availableQty:
                    variant.qty === null || variant.qty === undefined
                        ? null
                        : Math.max(Number(variant.qty || 0) - Number(variant.reservedQty || 0), 0)
            },
            size: selectedSize
                ? {
                      id: selectedSize.id,
                      size: selectedSize.size,
                      availableQty: Math.max(Number(selectedSize.qty || 0) - Number(selectedSize.reservedQty || 0), 0)
                  }
                : null
        }
    }

    async openShift(dto: OpenPosShiftDto, admin: AdminAuthenticatedUser) {
        const employee = await this.employeeRepo.findOneBy({id: admin.id})
        if (!employee || !employee.isActive) throw new BadRequestException("Employee is not active")

        const existingShift = await this.shiftRepo.findOne({
            where: {employee: {id: employee.id}, status: PosShiftStatus.OPEN},
            relations: {salesPoint: true, device: true}
        })
        if (existingShift) return existingShift

        const salesPoint = await this.salesPointRepo.findOneBy({id: dto.salesPointId})
        if (!salesPoint) throw new NotFoundException("Sales point not found")
        const isPosManager = admin.permissions.includes("pos.manage") || admin.permissions.includes("pos.manager")
        const employeeSalesPointIds = (employee.salesPoints || []).map((point) => point.id)
        if (!isPosManager && !employeeSalesPointIds.includes(salesPoint.id)) {
            throw new BadRequestException("Employee is not assigned to this sales point")
        }

        const device = dto.deviceId ? await this.deviceRepo.findOneBy({id: dto.deviceId, isActive: true}) : null
        if (dto.deviceId && !device) throw new NotFoundException("POS device not found")

        const shift = await this.shiftRepo.save(
            this.shiftRepo.create({
                employee,
                salesPoint,
                device,
                status: PosShiftStatus.OPEN,
                openedAt: new Date(),
                openingCashAmount: dto.openingCashAmount || 0
            })
        )

        await this.eventRepo.save(
            this.eventRepo.create({
                shift,
                employee,
                type: PosShiftEventType.OPEN,
                payload: {salesPointId: salesPoint.id, deviceId: device?.id || null, openingCashAmount: shift.openingCashAmount}
            })
        )

        return this.shiftRepo.findOne({where: {id: shift.id}, relations: {salesPoint: true, device: true, employee: true}})
    }

    async closeShift(id: number, dto: ClosePosShiftDto, admin: AdminAuthenticatedUser) {
        const shift = await this.shiftRepo.findOne({
            where: {id},
            relations: {employee: true, salesPoint: true, device: true}
        })
        if (!shift) throw new NotFoundException("POS shift not found")
        if (shift.status !== PosShiftStatus.OPEN) throw new BadRequestException("POS shift is already closed")
        if (shift.employee.id !== admin.id && !admin.permissions.includes("pos.manager") && !admin.permissions.includes("pos.manage")) {
            throw new BadRequestException("Only shift owner or POS manager can close this shift")
        }

        const closingCashAmount = dto.closingCashAmount || 0
        shift.status = PosShiftStatus.CLOSED
        shift.closedAt = new Date()
        shift.closingCashAmount = closingCashAmount
        shift.cashDifference = closingCashAmount - Number(shift.expectedCashAmount || 0)
        shift.closeComment = dto.comment || null
        await this.shiftRepo.save(shift)

        const employee = await this.employeeRepo.findOneBy({id: admin.id})
        await this.eventRepo.save(
            this.eventRepo.create({
                shift,
                employee,
                type: PosShiftEventType.CLOSE,
                payload: {
                    closingCashAmount: shift.closingCashAmount,
                    expectedCashAmount: shift.expectedCashAmount,
                    cashDifference: shift.cashDifference,
                    comment: shift.closeComment
                }
            })
        )

        return this.getShiftReport(id)
    }

    async getShiftReport(id: number) {
        const shift = await this.shiftRepo.findOne({
            where: {id},
            relations: {employee: true, salesPoint: true, device: true}
        })
        if (!shift) throw new NotFoundException("POS shift not found")

        const ordersCount = await this.orderRepo.count({where: {posShift: {id: shift.id}} as any})
        const totals = await this.orderRepo
            .createQueryBuilder("order")
            .select("COALESCE(SUM(order.total), 0)", "total")
            .where("order.posShiftId = :shiftId", {shiftId: shift.id})
            .getRawOne<{total: string}>()
        const events = await this.eventRepo.find({
            where: {shift: {id: shift.id}},
            relations: {employee: true},
            order: {id: "ASC"}
        })

        return {
            shift,
            ordersCount,
            salesTotal: Number(totals?.total || 0),
            events
        }
    }
}

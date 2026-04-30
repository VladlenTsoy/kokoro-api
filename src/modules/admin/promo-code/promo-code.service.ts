import {BadRequestException, Injectable, NotFoundException} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {PromoCodeEntity} from "./entities/promo-code.entity"
import {CreatePromoCodeDto} from "./dto/create-promo-code.dto"
import {UpdatePromoCodeDto} from "./dto/update-promo-code.dto"

@Injectable()
export class PromoCodeService {
    constructor(
        @InjectRepository(PromoCodeEntity)
        private readonly promoCodeRepository: Repository<PromoCodeEntity>
    ) {}

    private normalizeCode(code: string) {
        return code.trim().toUpperCase()
    }

    create(dto: CreatePromoCodeDto) {
        const entity = this.promoCodeRepository.create({
            ...dto,
            code: this.normalizeCode(dto.code),
            minOrderTotal: dto.minOrderTotal || 0,
            usageLimit: dto.usageLimit || null,
            startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
            endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
            isActive: dto.isActive !== false
        })
        return this.promoCodeRepository.save(entity)
    }

    findAll() {
        return this.promoCodeRepository.find({order: {id: "DESC"}})
    }

    async findOne(id: number) {
        const promoCode = await this.promoCodeRepository.findOneBy({id})
        if (!promoCode) throw new NotFoundException("Promo code not found")
        return promoCode
    }

    async update(id: number, dto: UpdatePromoCodeDto) {
        const promoCode = await this.findOne(id)
        if (dto.code !== undefined) promoCode.code = this.normalizeCode(dto.code)
        if (dto.discountType !== undefined) promoCode.discountType = dto.discountType
        if (dto.discountValue !== undefined) promoCode.discountValue = dto.discountValue
        if (dto.minOrderTotal !== undefined) promoCode.minOrderTotal = dto.minOrderTotal
        if (dto.usageLimit !== undefined) promoCode.usageLimit = dto.usageLimit
        if (dto.startsAt !== undefined) promoCode.startsAt = dto.startsAt ? new Date(dto.startsAt) : null
        if (dto.endsAt !== undefined) promoCode.endsAt = dto.endsAt ? new Date(dto.endsAt) : null
        if (dto.isActive !== undefined) promoCode.isActive = dto.isActive

        if (promoCode.usageLimit && promoCode.usedCount > promoCode.usageLimit) {
            throw new BadRequestException("usageLimit cannot be lower than usedCount")
        }

        return this.promoCodeRepository.save(promoCode)
    }

    async remove(id: number) {
        await this.findOne(id)
        return this.promoCodeRepository.delete(id)
    }
}

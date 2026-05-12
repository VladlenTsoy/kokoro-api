import {BadRequestException, Injectable, NotFoundException} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {ProductVariantEntity} from "../product-variant/entities/product-variant.entity"
import {ProductVariantSizeEntity} from "../product-variant-size/entities/product-variant-size.entity"
import {CreateProductBarcodeDto} from "./dto/create-product-barcode.dto"
import {UpdateProductBarcodeDto} from "./dto/update-product-barcode.dto"
import {ProductBarcodeEntity, ProductBarcodeType} from "./entities/product-barcode.entity"

@Injectable()
export class ProductBarcodeService {
    constructor(
        @InjectRepository(ProductBarcodeEntity)
        private readonly barcodeRepo: Repository<ProductBarcodeEntity>,
        @InjectRepository(ProductVariantEntity)
        private readonly variantRepo: Repository<ProductVariantEntity>,
        @InjectRepository(ProductVariantSizeEntity)
        private readonly sizeRepo: Repository<ProductVariantSizeEntity>
    ) {}

    findAll() {
        return this.barcodeRepo.find({relations: {productVariant: true, productVariantSize: {size: true}}, order: {id: "DESC"}})
    }

    async findByCode(code: string) {
        const normalizedCode = this.normalizeCode(code)
        const barcode = await this.barcodeRepo.findOne({
            where: {code: normalizedCode, isActive: true},
            relations: {
                productVariant: {product: true, color: true, discount: true, images: true, sizes: {size: true}},
                productVariantSize: {size: true}
            }
        })
        if (!barcode) throw new NotFoundException("Barcode not found")
        return barcode
    }

    async create(dto: CreateProductBarcodeDto) {
        const productVariant = await this.variantRepo.findOne({where: {id: dto.productVariantId}, relations: {sizes: true}})
        if (!productVariant) throw new NotFoundException("Product variant not found")

        const productVariantSize = dto.productVariantSizeId
            ? await this.sizeRepo.findOne({where: {id: dto.productVariantSizeId}, relations: {productVariant: true}})
            : null
        if (dto.productVariantSizeId && !productVariantSize) throw new NotFoundException("Product variant size not found")
        if (productVariantSize && productVariantSize.productVariant.id !== productVariant.id) {
            throw new BadRequestException("Barcode size does not belong to product variant")
        }

        const code = this.normalizeCode(dto.code)
        return this.barcodeRepo.save(
            this.barcodeRepo.create({
                productVariant,
                productVariantSize,
                code,
                type: dto.type || ProductBarcodeType.BARCODE,
                isActive: dto.isActive !== false
            })
        )
    }

    async update(id: number, dto: UpdateProductBarcodeDto) {
        const barcode = await this.barcodeRepo.findOne({
            where: {id},
            relations: {productVariant: true, productVariantSize: {productVariant: true}}
        })
        if (!barcode) throw new NotFoundException("Barcode not found")

        if (dto.productVariantId !== undefined) {
            const productVariant = await this.variantRepo.findOneBy({id: dto.productVariantId})
            if (!productVariant) throw new NotFoundException("Product variant not found")
            barcode.productVariant = productVariant
        }
        if (dto.productVariantSizeId !== undefined) {
            barcode.productVariantSize = dto.productVariantSizeId
                ? await this.sizeRepo.findOne({where: {id: dto.productVariantSizeId}, relations: {productVariant: true}})
                : null
            if (dto.productVariantSizeId && !barcode.productVariantSize) throw new NotFoundException("Product variant size not found")
        }
        if (barcode.productVariantSize && barcode.productVariantSize.productVariant.id !== barcode.productVariant.id) {
            throw new BadRequestException("Barcode size does not belong to product variant")
        }
        if (dto.code !== undefined) barcode.code = this.normalizeCode(dto.code)
        if (dto.type !== undefined) barcode.type = dto.type
        if (dto.isActive !== undefined) barcode.isActive = dto.isActive

        return this.barcodeRepo.save(barcode)
    }

    remove(id: number) {
        return this.barcodeRepo.delete(id)
    }

    private normalizeCode(code: string) {
        const normalized = code.trim()
        if (!normalized) throw new BadRequestException("Barcode is required")
        return normalized
    }
}

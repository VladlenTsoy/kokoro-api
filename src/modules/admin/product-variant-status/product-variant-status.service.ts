import {Injectable, NotFoundException} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {ProductVariantStatusEntity} from "./entities/product-variant-status.entity"
import {CreateProductVariantStatusDto} from "./dto/create-product-variant-status.dto"
import {UpdateProductVariantStatusDto} from "./dto/update-product-variant-status.dto"

@Injectable()
export class ProductVariantStatusService {
    constructor(
        @InjectRepository(ProductVariantStatusEntity)
        private readonly statusRepository: Repository<ProductVariantStatusEntity>
    ) {}

    // Автопозиция
    private async getNextPosition(): Promise<number> {
        const max = await this.statusRepository.createQueryBuilder("s").select("MAX(s.position)", "max").getRawOne()

        return (max?.max ?? 0) + 1
    }

    async create(dto: CreateProductVariantStatusDto) {
        const position = dto.position ?? (await this.getNextPosition())

        const status = this.statusRepository.create({
            ...dto,
            position
        })

        return this.statusRepository.save(status)
    }

    async findAll() {
        return this.statusRepository.find({
            order: {position: "ASC"}
        })
    }

    async findOne(id: number) {
        const status = await this.statusRepository.findOne({where: {id}})
        if (!status) throw new NotFoundException("Status not found")
        return status
    }

    async update(id: number, dto: UpdateProductVariantStatusDto) {
        const status = await this.findOne(id)

        Object.assign(status, dto)
        return this.statusRepository.save(status)
    }

    async remove(id: number) {
        const status = await this.findOne(id)
        return this.statusRepository.remove(status)
    }
}

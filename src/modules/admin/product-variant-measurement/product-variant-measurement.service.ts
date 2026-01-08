import {Injectable} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {In, Not, Repository} from "typeorm"
import {ProductVariantMeasurementEntity} from "./entities/product-variant-measurement.entity"
import {CreateProductVariantMeasurementDto} from "./dto/create-product-variant-measurement.dto"
import {UpdateProductVariantMeasurementDto} from "./dto/update-product-variant-measurement.dto"
import {ProductVariantEntity} from "../product-variant/entities/product-variant.entity"
import {ProductMeasurementDto} from "../product-variant/dto/create-product-variant.dto"

@Injectable()
export class ProductVariantMeasurementService {
    constructor(
        @InjectRepository(ProductVariantMeasurementEntity)
        private readonly repo: Repository<ProductVariantMeasurementEntity>
    ) {}

    create(dto: CreateProductVariantMeasurementDto) {
        return this.repo.save(dto)
    }

    findAll() {
        return this.repo.find()
    }

    findOne(id: number) {
        return this.repo.findOne({where: {id}})
    }

    update(id: number, dto: UpdateProductVariantMeasurementDto) {
        return this.repo.update(id, dto)
    }

    remove(id: number) {
        return this.repo.delete(id)
    }

    async updateOrDeleteByProductVariant(productVariant: ProductVariantEntity, measurements: ProductMeasurementDto[]) {
        const actualIds: number[] = []
        //
        if (measurements.length > 0) {
            await Promise.all(
                measurements.map(async (measurement) => {
                    if (measurement?.id) {
                        await this.update(measurement?.id, {
                            title: measurement.title,
                            descriptions: measurement.descriptions
                        })
                        actualIds.push(measurement.id)
                    } else {
                        const rep = await this.create({
                            title: measurement.title,
                            descriptions: measurement.descriptions,
                            productVariant: productVariant
                        })
                        actualIds.push(rep.id)
                    }
                })
            )
            // Delete other is not actual
            await this.repo.delete({
                id: Not(In(actualIds))
            })
        } else {
            return this.repo.delete({productVariant})
        }
    }
}

import {Injectable} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {ProductTagEntity, ProductTagType} from "../../admin/product-tag/entities/product-tag.entity"

@Injectable()
export class ClientProductTagService {
    constructor(
        @InjectRepository(ProductTagEntity)
        private readonly productTagRepository: Repository<ProductTagEntity>
    ) {}

    findAll(type?: ProductTagType) {
        const qb = this.productTagRepository
            .createQueryBuilder("tag")
            .where("tag.isActive = :isActive", {isActive: true})
            .orderBy("tag.type", "ASC")
            .addOrderBy("tag.sortOrder", "ASC")
            .addOrderBy("tag.title", "ASC")

        if (type) {
            qb.andWhere("tag.type = :type", {type})
        }

        return qb.getMany()
    }
}

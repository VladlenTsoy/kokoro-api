import {Injectable} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {CollectionEntity} from "../../admin/collection/entities/collection.entity"

@Injectable()
export class ClientCollectionService {
    constructor(
        @InjectRepository(CollectionEntity)
        private readonly collectionRepository: Repository<CollectionEntity>
    ) {}

    async findAllWithProducts() {
        return this.collectionRepository
            .createQueryBuilder("collection")
            .innerJoin("collection.productVariants", "productVariant")
            .andWhere("productVariant.status_id = :statusId", {statusId: 2})
            .select(["collection.id", "collection.title"])
            .distinct(true)
            .orderBy("collection.title", "ASC")
            .getMany()
    }
}

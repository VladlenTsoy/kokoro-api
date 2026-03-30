import {ConflictException, Injectable, NotFoundException} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {In, Repository} from "typeorm"
import {CollectionEntity} from "./entities/collection.entity"
import {CreateCollectionDto} from "./dto/create-collection.dto"
import {UpdateCollectionDto} from "./dto/update-collection.dto"

@Injectable()
export class CollectionService {
    constructor(
        @InjectRepository(CollectionEntity)
        private readonly collectionRepository: Repository<CollectionEntity>
    ) {}

    private normalizeTitle(title: string) {
        return title.trim()
    }

    async create(createCollectionDto: CreateCollectionDto) {
        const title = this.normalizeTitle(createCollectionDto.title)
        const exists = await this.collectionRepository.findOneBy({title})

        if (exists) {
            throw new ConflictException("Collection with this title already exists")
        }

        const collection = this.collectionRepository.create({title})
        return await this.collectionRepository.save(collection)
    }

    findAll() {
        return this.collectionRepository.find({order: {id: "DESC"}})
    }

    async findOne(id: number) {
        const collection = await this.collectionRepository.findOneBy({id})
        if (!collection) throw new NotFoundException("Collection not found")
        return collection
    }

    async update(id: number, updateCollectionDto: UpdateCollectionDto) {
        const collection = await this.findOne(id)

        if (updateCollectionDto.title !== undefined) {
            const title = this.normalizeTitle(updateCollectionDto.title)
            const exists = await this.collectionRepository.findOneBy({title})
            if (exists && exists.id !== id) {
                throw new ConflictException("Collection with this title already exists")
            }
            collection.title = title
        }

        return await this.collectionRepository.save(collection)
    }

    async remove(id: number) {
        const collection = await this.findOne(id)
        await this.collectionRepository.remove(collection)
        return {message: "Collection has been successfully removed"}
    }

    async findByIds(ids: number[]) {
        if (!ids?.length) return []
        return this.collectionRepository.find({where: {id: In(ids)}})
    }

    async findAllWithProducts() {
        return this.collectionRepository
            .createQueryBuilder("collection")
            .innerJoin("collection.productVariants", "productVariant")
            .select(["collection.id", "collection.title"])
            .distinct(true)
            .orderBy("collection.title", "ASC")
            .getMany()
    }
}

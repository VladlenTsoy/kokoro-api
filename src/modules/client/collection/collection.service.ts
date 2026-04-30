import {Injectable, NotFoundException} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {CollectionEntity} from "../../admin/collection/entities/collection.entity"
import {ProductVariantEntity} from "../../admin/product-variant/entities/product-variant.entity"

@Injectable()
export class ClientCollectionService {
    private readonly cdnBaseUrl = "https://kokoro-app.ams3.cdn.digitaloceanspaces.com/"

    constructor(
        @InjectRepository(CollectionEntity)
        private readonly collectionRepository: Repository<CollectionEntity>,
        @InjectRepository(ProductVariantEntity)
        private readonly productVariantRepository: Repository<ProductVariantEntity>
    ) {}

    private normalizePage(page?: number) {
        return page && Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
    }

    private normalizePageSize(pageSize?: number) {
        if (!pageSize || !Number.isFinite(pageSize) || pageSize <= 0) return 20
        return Math.min(Math.floor(pageSize), 60)
    }

    private toFullImageUrl(path?: string | null) {
        if (!path) return path
        if (/^https?:\/\//i.test(path)) return path
        const base = this.cdnBaseUrl.endsWith("/") ? this.cdnBaseUrl : `${this.cdnBaseUrl}/`
        const cleanPath = path.startsWith("/") ? path.slice(1) : path
        return `${base}${cleanPath}`
    }

    private withFullImageUrls<T extends {images?: {path?: string | null}[] | null}>(entity: T) {
        if (!entity?.images?.length) return entity
        entity.images = entity.images.map((image) => ({
            ...image,
            path: this.toFullImageUrl(image.path)
        }))
        return entity
    }

    private async findPublishedVariantsByIds(ids: number[]) {
        if (!ids.length) return []

        const items = await this.productVariantRepository
            .createQueryBuilder("productVariant")
            .leftJoinAndSelect("productVariant.discount", "discount")
            .leftJoinAndSelect("productVariant.color", "color")
            .leftJoinAndSelect("productVariant.sizes", "sizes")
            .leftJoinAndSelect("sizes.size", "size")
            .leftJoinAndSelect("productVariant.images", "images")
            .leftJoinAndSelect("productVariant.tags", "tags")
            .whereInIds(ids)
            .andWhere("productVariant.status_id = :statusId", {statusId: 2})
            .select([
                "productVariant.id",
                "productVariant.created_at",
                "productVariant.title",
                "productVariant.price",
                "productVariant.is_new",
                "color.id",
                "color.title",
                "color.hex",
                "sizes.id",
                "sizes.qty",
                "sizes.reservedQty",
                "sizes.min_qty",
                "size.id",
                "size.title",
                "images.id",
                "images.path",
                "images.position",
                "tags.id",
                "tags.title",
                "tags.slug",
                "tags.type",
                "tags.colorHex",
                "discount.discountPercent",
                "discount.startDate",
                "discount.endDate"
            ])
            .addOrderBy("size.id", "ASC")
            .addOrderBy("images.position", "ASC")
            .getMany()

        const orderMap = new Map(ids.map((id, index) => [id, index]))
        return items
            .sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0))
            .map((item) => this.withFullImageUrls(item))
    }

    async findAllWithProducts() {
        const rows = await this.collectionRepository
            .createQueryBuilder("collection")
            .innerJoin("collection.productVariants", "productVariant")
            .leftJoin("productVariant.images", "image")
            .andWhere("productVariant.status_id = :statusId", {statusId: 2})
            .select("collection.id", "id")
            .addSelect("collection.title", "title")
            .addSelect("COUNT(DISTINCT productVariant.id)", "productsCount")
            .addSelect("MIN(image.path)", "coverImagePath")
            .groupBy("collection.id")
            .addGroupBy("collection.title")
            .orderBy("collection.title", "ASC")
            .getRawMany<{id: number | string; title: string; productsCount: string; coverImagePath?: string | null}>()

        return rows.map((row) => ({
            id: Number(row.id),
            title: row.title,
            productsCount: Number(row.productsCount || 0),
            coverImageUrl: this.toFullImageUrl(row.coverImagePath)
        }))
    }

    async findProductsByCollection(collectionId: number, page?: number, pageSize?: number) {
        const currentPage = this.normalizePage(page)
        const currentPageSize = this.normalizePageSize(pageSize)
        const skip = (currentPage - 1) * currentPageSize

        const collection = await this.collectionRepository.findOne({where: {id: collectionId}, select: {id: true, title: true}})
        if (!collection) {
            throw new NotFoundException("Collection not found")
        }

        const countRow = await this.productVariantRepository
            .createQueryBuilder("pv")
            .innerJoin("pv.collections", "collection", "collection.id = :collectionId", {collectionId})
            .select("COUNT(DISTINCT pv.id)", "cnt")
            .where("pv.status_id = :statusId", {statusId: 2})
            .getRawOne<{cnt: string}>()

        const total = Number(countRow?.cnt || 0)
        const rawRows = await this.productVariantRepository
            .createQueryBuilder("pv")
            .innerJoin("pv.collections", "collection", "collection.id = :collectionId", {collectionId})
            .select("pv.id", "id")
            .where("pv.status_id = :statusId", {statusId: 2})
            .orderBy("pv.created_at", "DESC")
            .addOrderBy("pv.id", "DESC")
            .skip(skip)
            .take(currentPageSize)
            .getRawMany<{id: number | string}>()

        const ids = rawRows.map((row) => Number(row.id)).filter((id) => Number.isFinite(id))

        return {
            collection,
            items: await this.findPublishedVariantsByIds(ids),
            total,
            page: currentPage,
            pageSize: currentPageSize
        }
    }

    async findOneWithProducts(collectionId: number, page?: number, pageSize?: number) {
        return this.findProductsByCollection(collectionId, page, pageSize)
    }
}

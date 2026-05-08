import {Injectable, NotFoundException} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Not, Repository} from "typeorm"
import {ProductVariantEntity} from "../../admin/product-variant/entities/product-variant.entity"
import {ProductCategoryEntity} from "../../admin/product-category/entities/product-category.entity"
import {OrderItemEntity} from "../../admin/order-item/entities/order-item.entity"
import {OrderDeliveryStatus} from "../../admin/order/entities/order.entity"

@Injectable()
export class ClientProductVariantService {
    private readonly cdnBaseUrl = "https://kokoro-app.ams3.cdn.digitaloceanspaces.com/"

    constructor(
        @InjectRepository(ProductVariantEntity)
        private readonly productVariantRepository: Repository<ProductVariantEntity>,
        @InjectRepository(ProductCategoryEntity)
        private readonly productCategoryRepository: Repository<ProductCategoryEntity>,
        @InjectRepository(OrderItemEntity)
        private readonly orderItemRepository: Repository<OrderItemEntity>
    ) {}

    private toFullImageUrl(path?: string | null) {
        if (!path) return path
        if (/^https?:\/\//i.test(path)) return path
        const base = this.cdnBaseUrl.endsWith("/") ? this.cdnBaseUrl : `${this.cdnBaseUrl}/`
        const cleanPath = path.startsWith("/") ? path.slice(1) : path
        return `${base}${cleanPath}`
    }

    private normalizeLimit(limit?: number) {
        if (!limit || !Number.isFinite(limit) || limit <= 0) return 12
        return Math.min(Math.floor(limit), 30)
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
            .leftJoinAndSelect("productVariant.status", "status")
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
                "status.id",
                "status.title",
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

    private async resolveCategoryTreeIds(categoryId: number): Promise<number[]> {
        const categories = await this.productCategoryRepository.find({
            select: {
                id: true,
                parent_category_id: true
            }
        })

        const nodes = new Set(categories.map((category) => category.id))
        if (!nodes.has(categoryId)) return []

        const childrenByParent = new Map<number, number[]>()
        for (const category of categories) {
            if (category.parent_category_id == null) continue
            if (!childrenByParent.has(category.parent_category_id)) {
                childrenByParent.set(category.parent_category_id, [])
            }
            childrenByParent.get(category.parent_category_id)?.push(category.id)
        }

        const result: number[] = []
        const queue: number[] = [categoryId]
        const visited = new Set<number>()

        while (queue.length > 0) {
            const currentId = queue.shift() as number
            if (visited.has(currentId)) continue
            visited.add(currentId)
            result.push(currentId)

            const children = childrenByParent.get(currentId) || []
            for (const childId of children) {
                if (!visited.has(childId)) queue.push(childId)
            }
        }

        return result
    }

    async findAll({
        page,
        pageSize,
        sortOrder,
        categoryId,
        colorIds,
        sizeIds,
        tagIds,
        tagSlugs
    }: {
        page?: number
        pageSize?: number
        sortOrder?: string
        categoryId?: number
        colorIds?: number[]
        sizeIds?: number[]
        tagIds?: number[]
        tagSlugs?: string[]
    }) {
        const currentPage = page && page > 0 ? page : 1
        const currentPageSize = pageSize && pageSize > 0 ? pageSize : 20
        const skip = (currentPage - 1) * currentPageSize
        const take = currentPageSize
        const normalizedSortOrder = String(sortOrder || "desc").toLowerCase()
        const normalizedSortBy = String(sortOrder || "newest").toLowerCase()
        const sortDirection = normalizedSortBy === "oldest" || normalizedSortOrder === "asc" ? "ASC" : "DESC"
        const categoryIds =
            categoryId && Number.isFinite(categoryId)
                ? await this.resolveCategoryTreeIds(Number(categoryId))
                : undefined
        const normalizedColorIds = Array.isArray(colorIds) ? colorIds.filter((id) => Number.isFinite(id)) : []
        const normalizedSizeIds = Array.isArray(sizeIds) ? sizeIds.filter((id) => Number.isFinite(id)) : []
        const normalizedTagIds = Array.isArray(tagIds) ? tagIds.filter((id) => Number.isFinite(id)) : []
        const normalizedTagSlugs = Array.isArray(tagSlugs)
            ? tagSlugs.map((slug) => slug.trim().toLowerCase()).filter(Boolean)
            : []

        if (categoryId && (!categoryIds || categoryIds.length === 0)) {
            return {items: [], total: 0}
        }

        const countQb = this.productVariantRepository
            .createQueryBuilder("pv")
            .select("COUNT(DISTINCT pv.id)", "cnt")
            .where("pv.status_id = :statusId", {statusId: 2})

        if (categoryIds && categoryIds.length > 0) {
            countQb.leftJoin("pv.product", "product")
            countQb.andWhere("product.category_id IN (:...categoryIds)", {categoryIds})
        }
        if (normalizedColorIds.length > 0) {
            countQb.andWhere("pv.color_id IN (:...colorIds)", {colorIds: normalizedColorIds})
        }
        if (normalizedSizeIds.length > 0) {
            countQb.leftJoin("pv.sizes", "sizes_filter")
            countQb.andWhere("sizes_filter.size_id IN (:...sizeIds)", {sizeIds: normalizedSizeIds})
        }
        if (normalizedTagIds.length > 0 || normalizedTagSlugs.length > 0) {
            countQb.leftJoin("pv.tags", "tags_filter")
            if (normalizedTagIds.length > 0) {
                countQb.andWhere("tags_filter.id IN (:...tagIds)", {tagIds: normalizedTagIds})
            }
            if (normalizedTagSlugs.length > 0) {
                countQb.andWhere("tags_filter.slug IN (:...tagSlugs)", {tagSlugs: normalizedTagSlugs})
            }
        }

        const rawCount = await countQb.getRawOne()
        const total = parseInt(String(rawCount?.cnt ?? "0"), 10)

        const idsQb = this.productVariantRepository
            .createQueryBuilder("pv")
            .select("pv.id", "id")
            .distinct(true)
            .where("pv.status_id = :statusId", {statusId: 2})
            .orderBy(
                normalizedSortBy === "price_asc" || normalizedSortBy === "price_desc" ? "pv.price" : "pv.created_at",
                normalizedSortBy === "price_asc" ? "ASC" : normalizedSortBy === "price_desc" ? "DESC" : sortDirection
            )
            .addOrderBy("pv.id", sortDirection)
            .skip(skip)
            .take(take)

        if (categoryIds && categoryIds.length > 0) {
            idsQb.leftJoin("pv.product", "product")
            idsQb.andWhere("product.category_id IN (:...categoryIds)", {categoryIds})
        }
        if (normalizedColorIds.length > 0) {
            idsQb.andWhere("pv.color_id IN (:...colorIds)", {colorIds: normalizedColorIds})
        }
        if (normalizedSizeIds.length > 0) {
            idsQb.leftJoin("pv.sizes", "sizes_filter")
            idsQb.andWhere("sizes_filter.size_id IN (:...sizeIds)", {sizeIds: normalizedSizeIds})
        }
        if (normalizedTagIds.length > 0 || normalizedTagSlugs.length > 0) {
            idsQb.leftJoin("pv.tags", "tags_filter")
            if (normalizedTagIds.length > 0) {
                idsQb.andWhere("tags_filter.id IN (:...tagIds)", {tagIds: normalizedTagIds})
            }
            if (normalizedTagSlugs.length > 0) {
                idsQb.andWhere("tags_filter.slug IN (:...tagSlugs)", {tagSlugs: normalizedTagSlugs})
            }
        }

        const rawIdRows = await idsQb.getRawMany()

        const ids = rawIdRows.map((r: any) => r.id).filter(Boolean) as number[]
        if (ids.length === 0) return {items: [], total}

        const items = await this.productVariantRepository
            .createQueryBuilder("productVariant")
            .leftJoinAndSelect("productVariant.discount", "discount")
            .leftJoinAndSelect("productVariant.color", "color")
            .leftJoinAndSelect("productVariant.sizes", "sizes")
            .leftJoinAndSelect("sizes.size", "size")
            .leftJoinAndSelect("productVariant.images", "images")
            .leftJoinAndSelect("productVariant.status", "status")
            .leftJoinAndSelect("productVariant.tags", "tags")
            .whereInIds(ids)
            .select([
                "productVariant.id",
                "productVariant.created_at",
                "productVariant.title",
                "productVariant.price",
                "color.id",
                "color.title",
                "color.hex",
                "sizes.id",
                "sizes.qty",
                "sizes.reservedQty",
                "size.id",
                "size.title",
                "images.id",
                "images.path",
                "images.position",
                "status.id",
                "status.title",
                "tags.id",
                "tags.title",
                "tags.slug",
                "tags.type",
                "tags.colorHex",
                "discount.discountPercent",
                "discount.endDate"
            ])
            .orderBy("productVariant.id", "ASC")
            .addOrderBy("size.id", "ASC")
            .addOrderBy("images.position", "ASC")
            .getMany()

        const orderMap = new Map(ids.map((id, idx) => [id, idx]))
        items.sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0))

        return {items: items.map((item) => this.withFullImageUrls(item)), total}
    }

    async findAvailableColors(categoryId?: number) {
        const categoryIds =
            categoryId && Number.isFinite(categoryId)
                ? await this.resolveCategoryTreeIds(Number(categoryId))
                : undefined

        if (categoryId && (!categoryIds || categoryIds.length === 0)) {
            return []
        }

        const qb = this.productVariantRepository
            .createQueryBuilder("pv")
            .leftJoin("pv.color", "color")
            .select("color.id", "id")
            .addSelect("color.title", "title")
            .addSelect("color.hex", "hex")
            .where("pv.status_id = :statusId", {statusId: 2})
            .distinct(true)
            .orderBy("color.id", "ASC")

        if (categoryIds && categoryIds.length > 0) {
            qb.leftJoin("pv.product", "product")
            qb.andWhere("product.category_id IN (:...categoryIds)", {categoryIds})
        }

        const rawRows = await qb.getRawMany<{id: number | string; title: string; hex: string}>()
        return rawRows
            .filter((row) => row.id !== null && row.id !== undefined)
            .map((row) => ({
                id: Number(row.id),
                title: row.title,
                hex: row.hex
            }))
    }

    async findAvailableSizes(categoryId?: number) {
        const categoryIds =
            categoryId && Number.isFinite(categoryId)
                ? await this.resolveCategoryTreeIds(Number(categoryId))
                : undefined

        if (categoryId && (!categoryIds || categoryIds.length === 0)) {
            return []
        }

        const qb = this.productVariantRepository
            .createQueryBuilder("pv")
            .leftJoin("pv.sizes", "pvSize")
            .leftJoin("pvSize.size", "size")
            .select("size.id", "id")
            .addSelect("size.title", "title")
            .where("pv.status_id = :statusId", {statusId: 2})
            .andWhere("size.id IS NOT NULL")
            .distinct(true)
            .orderBy("size.id", "ASC")

        if (categoryIds && categoryIds.length > 0) {
            qb.leftJoin("pv.product", "product")
            qb.andWhere("product.category_id IN (:...categoryIds)", {categoryIds})
        }

        const rawRows = await qb.getRawMany<{id: number | string; title: string}>()
        return rawRows
            .filter((row) => row.id !== null && row.id !== undefined)
            .map((row) => ({
                id: Number(row.id),
                title: row.title
            }))
    }

    async findNewArrivals(limit?: number) {
        const safeLimit = this.normalizeLimit(limit)
        const rawRows = await this.productVariantRepository
            .createQueryBuilder("pv")
            .select("pv.id", "id")
            .where("pv.status_id = :statusId", {statusId: 2})
            .orderBy("pv.created_at", "DESC")
            .addOrderBy("pv.id", "DESC")
            .limit(safeLimit)
            .getRawMany<{id: number | string}>()

        const ids = rawRows.map((row) => Number(row.id)).filter((id) => Number.isFinite(id))
        return this.findPublishedVariantsByIds(ids)
    }

    async findBestsellers(limit?: number) {
        const safeLimit = this.normalizeLimit(limit)
        const rawRows = await this.orderItemRepository
            .createQueryBuilder("item")
            .innerJoin("item.order", "order")
            .innerJoin("item.productVariant", "pv")
            .select("pv.id", "id")
            .addSelect("SUM(item.qty)", "soldQty")
            .where("pv.status_id = :statusId", {statusId: 2})
            .andWhere("order.deliveryStatus != :cancelledStatus", {cancelledStatus: OrderDeliveryStatus.CANCELLED})
            .groupBy("pv.id")
            .orderBy("soldQty", "DESC")
            .addOrderBy("MAX(item.createdAt)", "DESC")
            .limit(safeLimit)
            .getRawMany<{id: number | string; soldQty: string}>()

        const ids = rawRows.map((row) => Number(row.id)).filter((id) => Number.isFinite(id))
        return this.findPublishedVariantsByIds(ids)
    }

    async findDiscounted(limit?: number) {
        const safeLimit = this.normalizeLimit(limit)
        const now = new Date()
        const rawRows = await this.productVariantRepository
            .createQueryBuilder("pv")
            .innerJoin("pv.discount", "discount")
            .select("pv.id", "id")
            .where("pv.status_id = :statusId", {statusId: 2})
            .andWhere("discount.discountPercent > 0")
            .andWhere("(discount.startDate IS NULL OR discount.startDate <= :now)", {now})
            .andWhere("(discount.endDate IS NULL OR discount.endDate >= :now)", {now})
            .orderBy("discount.discountPercent", "DESC")
            .addOrderBy("pv.created_at", "DESC")
            .addOrderBy("pv.id", "DESC")
            .limit(safeLimit)
            .getRawMany<{id: number | string}>()

        const ids = rawRows.map((row) => Number(row.id)).filter((id) => Number.isFinite(id))
        return this.findPublishedVariantsByIds(ids)
    }

    async findOne(id: number) {
        const productVariant = await this.productVariantRepository
            .createQueryBuilder("productVariant")
            .leftJoinAndSelect("productVariant.product", "product")
            .leftJoinAndSelect("productVariant.discount", "discount")
            .leftJoinAndSelect("productVariant.color", "color")
            .leftJoinAndSelect("productVariant.sizes", "sizes")
            .leftJoinAndSelect("sizes.size", "size")
            .leftJoinAndSelect("productVariant.images", "images")
            .leftJoinAndSelect("productVariant.measurements", "measurements")
            .leftJoinAndSelect("productVariant.collections", "collections")
            .leftJoinAndSelect("productVariant.tags", "tags")
            .leftJoinAndSelect("product.properties", "properties")
            .where("productVariant.id = :id", {id})
            .select([
                "productVariant.id",
                "productVariant.title",
                "productVariant.description",
                "productVariant.price",
                "productVariant.is_new",
                "productVariant.status_id",
                "productVariant.product_id",
                "product.id",
                "color.id",
                "color.title",
                "color.hex",
                "sizes.id",
                "sizes.qty",
                "sizes.reservedQty",
                "sizes.soldQty",
                "sizes.cost_price",
                "sizes.min_qty",
                "size.id",
                "size.title",
                "discount.discountPercent",
                "discount.endDate",
                "measurements.id",
                "measurements.title",
                "measurements.descriptions",
                "properties.id",
                "properties.title",
                "properties.description",
                "collections.id",
                "collections.title",
                "tags.id",
                "tags.title",
                "tags.slug",
                "tags.type",
                "tags.colorHex",
                "images.id",
                "images.name",
                "images.path",
                "images.position",
                "images.size"
            ])
            .orderBy("size.id", "ASC")
            .addOrderBy("images.position", "ASC")
            .getOne()

        if (!productVariant || productVariant.status_id !== 2) {
            throw new NotFoundException("The product variant was not found")
        }

        const relatedVariants = await this.productVariantRepository.find({
            where: {
                product_id: productVariant.product_id,
                status_id: 2,
                id: Not(productVariant.id)
            },
            select: {
                id: true,
                title: true,
                color: {
                    id: true,
                    title: true,
                    hex: true
                }
            },
            relations: {
                color: true
            },
            order: {
                created_at: "DESC",
                id: "DESC"
            }
        })

        productVariant.related_variants = relatedVariants

        return this.withFullImageUrls(productVariant)
    }
}

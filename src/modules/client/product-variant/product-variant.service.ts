import {Injectable, NotFoundException} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Not, Repository} from "typeorm"
import {ProductVariantEntity} from "../../admin/product-variant/entities/product-variant.entity"

@Injectable()
export class ClientProductVariantService {
    private readonly cdnBaseUrl = "https://kokoro-app.ams3.cdn.digitaloceanspaces.com/"

    constructor(
        @InjectRepository(ProductVariantEntity)
        private readonly productVariantRepository: Repository<ProductVariantEntity>
    ) {}

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

    async findAll({page, pageSize, sortOrder}: {page?: number; pageSize?: number; sortOrder?: string}) {
        const currentPage = page && page > 0 ? page : 1
        const currentPageSize = pageSize && pageSize > 0 ? pageSize : 20
        const skip = (currentPage - 1) * currentPageSize
        const take = currentPageSize
        const normalizedSortOrder = String(sortOrder || "desc").toLowerCase()
        const sortDirection = normalizedSortOrder === "asc" ? "ASC" : "DESC"

        const rawCount = await this.productVariantRepository
            .createQueryBuilder("pv")
            .select("COUNT(DISTINCT pv.id)", "cnt")
            .where("pv.status_id = :statusId", {statusId: 2})
            .getRawOne()
        const total = parseInt(String(rawCount?.cnt ?? "0"), 10)

        const rawIdRows = await this.productVariantRepository
            .createQueryBuilder("pv")
            .select("pv.id", "id")
            .distinct(true)
            .where("pv.status_id = :statusId", {statusId: 2})
            .orderBy("pv.created_at", sortDirection)
            .addOrderBy("pv.id", sortDirection)
            .skip(skip)
            .take(take)
            .getRawMany()

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
                "size.id",
                "size.title",
                "images.id",
                "images.path",
                "images.position",
                "status.id",
                "status.title",
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
            .leftJoinAndSelect("product.properties", "properties")
            .where("productVariant.id = :id", {id})
            .select([
                "productVariant.id",
                "productVariant.title",
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

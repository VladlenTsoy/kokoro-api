import {Injectable} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {ProductCategoryEntity} from "../../admin/product-category/entities/product-category.entity"
import {ProductVariantEntity} from "../../admin/product-variant/entities/product-variant.entity"

export interface ClientCategoryTreeItem {
    id: number
    title: string
    url: string
    sub_categories: ClientCategoryTreeItem[]
}

@Injectable()
export class ClientProductCategoryService {
    constructor(
        @InjectRepository(ProductCategoryEntity)
        private readonly productCategoryRepository: Repository<ProductCategoryEntity>,
        @InjectRepository(ProductVariantEntity)
        private readonly productVariantRepository: Repository<ProductVariantEntity>
    ) {}

    async findAllWithSubCategories(): Promise<ClientCategoryTreeItem[]> {
        type RawCategory = {id: number; title: string; url: string; parent_category_id: number | null}

        const rawCategories = await this.productCategoryRepository
            .createQueryBuilder("category")
            .select("category.id", "id")
            .addSelect("category.title", "title")
            .addSelect("category.url", "url")
            .addSelect("category.parent_category_id", "parent_category_id")
            .orderBy("category.id", "ASC")
            .getRawMany<{id: number | string; title: string; url: string; parent_category_id: number | string | null}>()

        const visibleCategories: RawCategory[] = rawCategories.map((category) => ({
            id: Number(category.id),
            title: category.title,
            url: category.url,
            parent_category_id: category.parent_category_id === null ? null : Number(category.parent_category_id)
        }))
        const activeCategoryRows = await this.productVariantRepository
            .createQueryBuilder("pv")
            .leftJoin("pv.product", "product")
            .select("DISTINCT product.category_id", "category_id")
            .where("pv.status_id = :statusId", {statusId: 2})
            .andWhere("product.category_id IS NOT NULL")
            .getRawMany<{category_id: number | string}>()
        const activeCategoryIds = new Set(activeCategoryRows.map((row) => Number(row.category_id)).filter(Boolean))

        const nodes = new Map<number, ClientCategoryTreeItem>()

        for (const category of visibleCategories) {
            nodes.set(category.id, {
                id: category.id,
                title: category.title,
                url: category.url,
                sub_categories: []
            })
        }

        for (const category of visibleCategories) {
            const node = nodes.get(category.id)
            if (!node) continue
            const parentId = category.parent_category_id
            if (parentId == null || parentId === 0) continue
            const parentNode = nodes.get(parentId)
            if (parentNode) parentNode.sub_categories.push(node)
        }

        const roots: ClientCategoryTreeItem[] = []
        for (const category of visibleCategories) {
            const parentId = category.parent_category_id
            if (parentId == null || parentId === 0 || !nodes.has(parentId)) {
                const rootNode = nodes.get(category.id)
                if (rootNode) roots.push(rootNode)
            }
        }

        const pruneByActiveProducts = (node: ClientCategoryTreeItem): ClientCategoryTreeItem | null => {
            const filteredChildren = node.sub_categories
                .map((child) => pruneByActiveProducts(child))
                .filter((child): child is ClientCategoryTreeItem => child !== null)

            const hasActiveProducts = activeCategoryIds.has(node.id)
            if (!hasActiveProducts && filteredChildren.length === 0) return null

            return {
                ...node,
                sub_categories: filteredChildren
            }
        }

        return roots
            .map((root) => pruneByActiveProducts(root))
            .filter((root): root is ClientCategoryTreeItem => root !== null)
    }
}

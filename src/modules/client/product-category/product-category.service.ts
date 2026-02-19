import {Injectable} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {ProductCategoryEntity} from "../../admin/product-category/entities/product-category.entity"

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
        private readonly productCategoryRepository: Repository<ProductCategoryEntity>
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

        return roots
    }
}

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
        type RawCategory = {
            id: number
            title: string
            url: string
            parent_category_id: number | null
        }

        const categories = await this.productCategoryRepository.find({
            where: {is_hide: null},
            select: {
                id: true,
                title: true,
                url: true,
                parent_category_id: true
            },
            order: {id: "ASC"}
        })

        const nodes = new Map<number, ClientCategoryTreeItem>()
        const childrenByParent = new Map<number, ClientCategoryTreeItem[]>()

        for (const category of categories as RawCategory[]) {
            nodes.set(category.id, {
                id: category.id,
                title: category.title,
                url: category.url,
                sub_categories: []
            })
        }

        for (const category of categories as RawCategory[]) {
            const node = nodes.get(category.id)
            if (!node) continue

            if (category.parent_category_id === null) continue

            if (!childrenByParent.has(category.parent_category_id)) {
                childrenByParent.set(category.parent_category_id, [])
            }
            childrenByParent.get(category.parent_category_id)?.push(node)
        }

        for (const [parentId, children] of childrenByParent.entries()) {
            const parentNode = nodes.get(parentId)
            if (parentNode) {
                parentNode.sub_categories = children
            }
        }

        const roots: ClientCategoryTreeItem[] = []
        for (const category of categories as RawCategory[]) {
            if (category.parent_category_id === null) {
                const rootNode = nodes.get(category.id)
                if (rootNode) roots.push(rootNode)
            }
        }

        return roots
    }
}

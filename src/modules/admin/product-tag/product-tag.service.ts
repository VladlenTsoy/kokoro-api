import {BadRequestException, ConflictException, Injectable, NotFoundException} from "@nestjs/common"
import {CreateProductTagDto} from "./dto/create-product-tag.dto"
import {UpdateProductTagDto} from "./dto/update-product-tag.dto"
import {InjectRepository} from "@nestjs/typeorm"
import {In, Not, Repository} from "typeorm"
import {ProductTagEntity, ProductTagType} from "./entities/product-tag.entity"

const CYRILLIC_TRANSLIT: Record<string, string> = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ё: "e",
    ж: "zh",
    з: "z",
    и: "i",
    й: "y",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "h",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "sch",
    ъ: "",
    ы: "y",
    ь: "",
    э: "e",
    ю: "yu",
    я: "ya"
}

@Injectable()
export class ProductTagService {
    constructor(
        @InjectRepository(ProductTagEntity)
        private readonly productTagRepository: Repository<ProductTagEntity>
    ) {}

    /**
     * Error output not found
     * @private
     */
    private errorNotFound() {
        throw new NotFoundException("The product tag was not found")
    }

    private normalizeSlug(value: string) {
        const transliterated = value
            .toLowerCase()
            .split("")
            .map((char) => CYRILLIC_TRANSLIT[char] ?? char)
            .join("")

        const slug = transliterated
            .normalize("NFKD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 120)

        return slug || "tag"
    }

    private normalizeColorHex(value?: string | null) {
        return value ? value.trim().toUpperCase() : null
    }

    private normalizeType(value?: ProductTagType | null) {
        return value || ProductTagType.CUSTOM
    }

    private async assertUniqueSlug(slug: string, exceptId?: number) {
        const existing = await this.productTagRepository.findOne({
            where: exceptId ? {slug, id: Not(exceptId)} : {slug}
        })

        if (existing) {
            throw new ConflictException("Product tag with this title or slug already exists")
        }
    }

    private async assertUniqueTitle(title: string, exceptId?: number) {
        const qb = this.productTagRepository
            .createQueryBuilder("tag")
            .where("LOWER(tag.title) = LOWER(:title)", {title})

        if (exceptId) {
            qb.andWhere("tag.id != :exceptId", {exceptId})
        }

        const existing = await qb.getOne()
        if (existing) {
            throw new ConflictException("Product tag with this title or slug already exists")
        }
    }

    async create(createProductTagDto: CreateProductTagDto) {
        const title = createProductTagDto.title.trim()
        if (!title) throw new BadRequestException("Tag title is required")

        const slug = this.normalizeSlug(createProductTagDto.slug || title)
        await this.assertUniqueTitle(title)
        await this.assertUniqueSlug(slug)

        const productTag = this.productTagRepository.create({
            title,
            slug,
            type: this.normalizeType(createProductTagDto.type),
            colorHex: this.normalizeColorHex(createProductTagDto.colorHex),
            isActive: createProductTagDto.isActive ?? true,
            sortOrder: createProductTagDto.sortOrder ?? 100
        })

        return await this.productTagRepository.save(productTag)
    }

    findAll(filter?: {type?: ProductTagType; isActive?: boolean; search?: string}) {
        const qb = this.productTagRepository
            .createQueryBuilder("tag")
            .orderBy("tag.type", "ASC")
            .addOrderBy("tag.sortOrder", "ASC")
            .addOrderBy("tag.title", "ASC")

        if (filter?.type) {
            qb.andWhere("tag.type = :type", {type: filter.type})
        }
        if (filter?.isActive !== undefined) {
            qb.andWhere("tag.isActive = :isActive", {isActive: filter.isActive})
        }
        if (filter?.search?.trim()) {
            qb.andWhere("(LOWER(tag.title) LIKE LOWER(:search) OR LOWER(tag.slug) LIKE LOWER(:search))", {
                search: `%${filter.search.trim()}%`
            })
        }

        return qb.getMany()
    }

    findByIds(tagIds: number[]) {
        const normalizedIds = Array.from(new Set((tagIds || []).map((id) => Number(id)).filter((id) => Number.isFinite(id))))
        if (!normalizedIds.length) return Promise.resolve([])

        return this.productTagRepository.find({where: {id: In(normalizedIds)}}).then((tags) => {
            if (tags.length !== normalizedIds.length) {
                const foundIds = new Set(tags.map((tag) => tag.id))
                const missingIds = normalizedIds.filter((id) => !foundIds.has(id))
                throw new BadRequestException(`Product tag(s) not found: ${missingIds.join(", ")}`)
            }

            return tags
        })
    }

    async findOne(id: number) {
        const productTag = await this.productTagRepository.findOneBy({id})
        // Not found product tag
        if (!productTag) this.errorNotFound()

        return productTag
    }

    async update(id: number, updateProductTagDto: UpdateProductTagDto) {
        const productTag = await this.productTagRepository.findOneBy({id})
        // Not found product tag
        if (!productTag) this.errorNotFound()

        if (updateProductTagDto.title !== undefined) {
            const title = updateProductTagDto.title.trim()
            if (!title) throw new BadRequestException("Tag title is required")
            await this.assertUniqueTitle(title, id)
            productTag.title = title
        }
        if (updateProductTagDto.slug !== undefined || updateProductTagDto.title !== undefined) {
            const slug = this.normalizeSlug(updateProductTagDto.slug || productTag.title)
            await this.assertUniqueSlug(slug, id)
            productTag.slug = slug
        }
        if (updateProductTagDto.type !== undefined) productTag.type = this.normalizeType(updateProductTagDto.type)
        if (updateProductTagDto.colorHex !== undefined) productTag.colorHex = this.normalizeColorHex(updateProductTagDto.colorHex)
        if (updateProductTagDto.isActive !== undefined) productTag.isActive = updateProductTagDto.isActive
        if (updateProductTagDto.sortOrder !== undefined) productTag.sortOrder = updateProductTagDto.sortOrder

        return await this.productTagRepository.save(productTag)
    }

    async remove(id: number) {
        const productTag = await this.productTagRepository.findOneBy({id})
        // Not found product tag
        if (!productTag) this.errorNotFound()
        await this.productTagRepository.delete(id)
        // Success message
        return {message: "Product tag has been successfully removed"}
    }

    findActiveForClient(type?: ProductTagType) {
        return this.findAll({type, isActive: true})
    }
}

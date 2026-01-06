import {Injectable, NotFoundException} from "@nestjs/common"
import {CreateProductVariantDto} from "./dto/create-product-variant.dto"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {ProductVariantEntity} from "./entities/product-variant.entity"
import {ProductService} from "../product/product.service"
import {ProductVariantSizeService} from "../product-variant-size/product-variant-size.service"
import {ProductVariantImageService} from "../product-variant-image/product-variant-image.service"
import {AwsService} from "../aws/aws.service"
import {UpdateProductVariantDto} from "./dto/update-product-variant.dto"
import {ProductTagService} from "../product-tag/product-tag.service"
import {FilterProductVariantDto} from "./dto/filter-product-variant.dto"
import {ProductVariantDiscountService} from "../product-variant-discount/product-variant-discount.service"

@Injectable()
export class ProductVariantService {
    constructor(
        @InjectRepository(ProductVariantEntity)
        private readonly productVariantRepository: Repository<ProductVariantEntity>,
        private readonly productService: ProductService,
        private readonly productSizeService: ProductVariantSizeService,
        private readonly productVariantImageService: ProductVariantImageService,
        private readonly awsService: AwsService,
        private readonly productTagService: ProductTagService,
        private readonly productDiscountService: ProductVariantDiscountService
    ) {}

    async create(createProductVariantDto: CreateProductVariantDto) {
        // Select product id
        let productId = createProductVariantDto?.product_id
        const categoryId = createProductVariantDto?.category_id
        const statusId = createProductVariantDto?.status_id
        const storageId = createProductVariantDto?.storage_id
        const tags = createProductVariantDto?.tags
        const productProperties = createProductVariantDto?.productProperties
        const discount = createProductVariantDto?.discount
        const isNew = createProductVariantDto?.is_new

        // Check product_id, if it doesn't exist, create it
        if (!productId) {
            const product = await this.productService.create({category_id: categoryId, properties: productProperties})
            productId = product.id
        }

        // Create product variant
        const productVariant = this.productVariantRepository.create({
            title: createProductVariantDto.title,
            price: createProductVariantDto.price,
            product_id: productId,
            storage_id: storageId,
            status_id: statusId,
            is_new: isNew,
            color_id: createProductVariantDto.color_id
        })

        // Create product tags
        if (tags?.length) {
            productVariant.tags = await this.productTagService.findByIds(createProductVariantDto.tags)
        }

        // Save product variant
        await this.productVariantRepository.save(productVariant)

        // Create discount
        if (discount && discount.discountPercent > 0) {
            const selectedDiscount = await this.productDiscountService.findOneByProductVariantId(productVariant.id)
            if (selectedDiscount) {
                await this.productDiscountService.update(selectedDiscount.id, {
                    discountPercent: discount.discountPercent,
                    endDate: discount.endDate
                })
            } else {
                await this.productDiscountService.create({
                    discountPercent: discount.discountPercent,
                    endDate: discount.endDate,
                    productVariant: productVariant
                })
            }
        } else {
            await this.productDiscountService.removeByProductVariantId(productVariant.id)
        }

        // Create product sizes
        await Promise.all(
            createProductVariantDto.product_sizes.map(async (productSize) => {
                await this.productSizeService.create({
                    ...productSize,
                    cost_price: productSize.cost_price || 0,
                    product_variant_id: productVariant.id
                })
            })
        )

        // Move images and Create product images
        if (createProductVariantDto.product_images && createProductVariantDto.product_images.length) {
            // Move images from tmp folder
            const images = await Promise.all(
                createProductVariantDto.product_images.map(async (productImage) => {
                    const newPath = `kokoro/${productVariant.id}/${productImage.name}`
                    await this.awsService.moveFile(productImage.key, newPath)

                    return {...productImage, path: newPath}
                })
            )
            //Create product image
            await Promise.all(
                images.map(async (image, key) => {
                    await this.productVariantImageService.create({
                        ...image,
                        position: image.position || key + 1,
                        product_variant_id: productVariant.id
                    })
                })
            )
        }

        return productVariant
    }

    // Внутри сервиса (замените старую функцию applyFilters и/или findAll на эту реализацию)
    async findAll(filter: FilterProductVariantDto) {
        const page = Number(filter.page) > 0 ? Number(filter.page) : 1
        const pageSize = Number(filter.pageSize) > 0 ? Number(filter.pageSize) : 20
        const skip = (page - 1) * pageSize
        const take = pageSize

        const pvMeta = this.productVariantRepository.metadata
        const hasRelation = (meta: any, prop: string) => meta.relations.some((r: any) => r.propertyName === prop)
        const getRelationMeta = (meta: any, prop: string) => meta.relations.find((r: any) => r.propertyName === prop)

        const applyFilters = (
            qb: any,
            f: {search?: string; categoryIds?: number[]; sizeIds?: number[]; statusId: string}
        ) => {
            const {search, categoryIds, sizeIds, statusId} = f

            // 1) search by pv.title OR product.title
            if (search && String(search).trim() !== "") {
                const s = `%${String(search).trim()}%`
                qb.andWhere(`LOWER(pv.title) LIKE LOWER(:s)`, {s})
            }

            // 2) filter by categoryIds:
            // У вас есть поле product.category_id (scalar). Поэтому делаем join product (если нужно)
            // и фильтруем по product.category_id IN (...)
            if (Array.isArray(categoryIds) && categoryIds.length > 0) {
                // если у pv нет relation product — ошибка (нужна product_id -> product)
                if (!hasRelation(pvMeta, "product")) {
                    throw new Error('Relation "product" not found on ProductVariant. Cant filter by category.')
                }

                // join product если ещё не присоединён
                if (!qb.expressionMap.aliases.some((a: any) => a.name === "product")) {
                    qb.leftJoin("pv.product", "product")
                }

                // фильтр по scalar column product.category_id
                qb.andWhere("product.category_id IN (:...categoryIds)", {categoryIds})
            }

            // 3) filter by sizeIds (как раньше)
            if (Array.isArray(sizeIds) && sizeIds.length > 0) {
                if (!hasRelation(pvMeta, "sizes")) {
                    throw new Error('Relation "sizes" not found on ProductVariant.')
                }

                const sizesRel = getRelationMeta(pvMeta, "sizes")
                const sizesMeta = sizesRel.inverseEntityMetadata

                if (!sizesMeta.relations.some((r: any) => r.propertyName === "size")) {
                    throw new Error(
                        `Relation "size" not found on ${sizesMeta.name}. Available relations: ${sizesMeta.relations
                            .map((r: any) => r.propertyName)
                            .join(", ")}`
                    )
                }

                if (!qb.expressionMap.aliases.some((a: any) => a.name === "sizes_filter")) {
                    qb.leftJoin("pv.sizes", "sizes_filter")
                }
                if (!qb.expressionMap.aliases.some((a: any) => a.name === "size_filter")) {
                    qb.leftJoin("sizes_filter.size", "size_filter")
                }
                qb.andWhere("size_filter.id IN (:...sizeIds)", {sizeIds})
            }

            // FILTER statusId
            if (statusId !== undefined && statusId !== null) {
                qb.andWhere("pv.status_id = :statusId", {statusId})
            }

            return qb
        }

        // --- остальные части findAll не меняем: countQb, idsQb, final fetch ---
        const countQb = this.productVariantRepository.createQueryBuilder("pv")
        applyFilters(countQb, {
            search: filter.search,
            categoryIds: filter.categoryIds,
            sizeIds: filter.sizeIds,
            statusId: filter.statusId
        })
        const rawCount = await countQb.select("COUNT(DISTINCT pv.id)", "cnt").getRawOne()
        const total = parseInt(String(rawCount?.cnt ?? "0"), 10)

        const idsQb = this.productVariantRepository
            .createQueryBuilder("pv")
            .select("pv.id", "id")
            .distinct(true)
            .orderBy("pv.id", "ASC")
            .skip(skip)
            .take(take)

        applyFilters(idsQb, {
            search: filter.search,
            categoryIds: filter.categoryIds,
            sizeIds: filter.sizeIds,
            statusId: filter.statusId
        })

        const rawIdRows = await idsQb.getRawMany()
        const ids = rawIdRows.map((r: any) => r.id).filter(Boolean) as number[]

        if (ids.length === 0) return {items: [], total}

        const variants = await this.productVariantRepository
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
                "productVariant.title",
                "productVariant.price",
                "color.id",
                "color.title",
                "color.hex",
                "sizes.id",
                "sizes.qty",
                "sizes.min_qty",
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
            .getMany()

        const orderMap = new Map(ids.map((id, idx) => [id, idx]))
        variants.sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0))

        return {items: variants, total}
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
            .leftJoinAndSelect("productVariant.status", "status")
            .where("productVariant.id = :id", {id})
            .select([
                "productVariant.id",
                "productVariant.title",
                "productVariant.price",
                "productVariant.color_id",
                "productVariant.storage_id",
                "productVariant.status_id",
                "productVariant.is_new",

                // category_id из product
                "product.category_id",

                "sizes.id",
                "sizes.qty",
                "sizes.cost_price",
                "sizes.min_qty",

                "size.id",
                "size.title",

                "discount.discountPercent",
                "discount.endDate",

                "images.id",
                "images.name",
                "images.path",
                "images.position",
                "images.size"
            ])
            .orderBy("size.id", "ASC")
            .getOne()

        if (!productVariant) throw new NotFoundException("The product variant was not found")
        return productVariant
    }

    async update(id: number, updateProductVariantDto: UpdateProductVariantDto) {
        const productVariant = await this.productVariantRepository.findOneBy({id})
        if (!productVariant) throw new NotFoundException("The product variant was not found")

        if (updateProductVariantDto.title !== undefined) productVariant.title = updateProductVariantDto.title
        if (updateProductVariantDto.price !== undefined) productVariant.price = updateProductVariantDto.price
        if (updateProductVariantDto.color_id !== undefined) productVariant.color_id = updateProductVariantDto.color_id
        if (updateProductVariantDto.product_id !== undefined)
            productVariant.product_id = updateProductVariantDto.product_id

        return this.productVariantRepository.save(productVariant)
    }

    async remove(id: number) {
        const productVariant = await this.productVariantRepository.findOneBy({id})
        if (!productVariant) throw new NotFoundException("The product variant was not found")
        await this.productSizeService.removeByProductVariantId(id)
        await this.productVariantImageService.removeByProductVariantId(id)
        await this.productVariantRepository.delete(id)
        return {message: "Product variant has been successfully removed"}
    }
}

import {Test, TestingModule} from "@nestjs/testing"
import {getRepositoryToken} from "@nestjs/typeorm"
import {NotFoundException} from "@nestjs/common"
import {ClientProductVariantService} from "./product-variant.service"
import {ProductVariantEntity} from "../../admin/product-variant/entities/product-variant.entity"

describe("ClientProductVariantService", () => {
    let service: ClientProductVariantService

    const createListQueryBuilder = (items: ProductVariantEntity[] = []) => {
        return {
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            addOrderBy: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            getMany: jest.fn().mockResolvedValue(items)
        }
    }

    const createOneQueryBuilder = (item: ProductVariantEntity | null) => {
        return {
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            addOrderBy: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValue(item)
        }
    }

    it("returns paginated items with total", async () => {
        const items = [{id: 1} as ProductVariantEntity]
        const qb = createListQueryBuilder(items)
        const repo = {
            count: jest.fn().mockResolvedValue(10),
            createQueryBuilder: jest.fn().mockReturnValue(qb)
        }

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ClientProductVariantService,
                {
                    provide: getRepositoryToken(ProductVariantEntity),
                    useValue: repo
                }
            ]
        }).compile()

        service = module.get(ClientProductVariantService)

        const result = await service.findAll({page: 2, pageSize: 5})

        expect(result).toEqual({items, total: 10})
        expect(repo.count).toHaveBeenCalled()
        expect(qb.skip).toHaveBeenCalledWith(5)
        expect(qb.take).toHaveBeenCalledWith(5)
    })

    it("uses default pagination when params are missing", async () => {
        const items = [] as ProductVariantEntity[]
        const qb = createListQueryBuilder(items)
        const repo = {
            count: jest.fn().mockResolvedValue(0),
            createQueryBuilder: jest.fn().mockReturnValue(qb)
        }

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ClientProductVariantService,
                {
                    provide: getRepositoryToken(ProductVariantEntity),
                    useValue: repo
                }
            ]
        }).compile()

        service = module.get(ClientProductVariantService)

        await service.findAll({})

        expect(qb.skip).toHaveBeenCalledWith(0)
        expect(qb.take).toHaveBeenCalledWith(20)
    })

    it("returns product variant by id", async () => {
        const item = {id: 7} as ProductVariantEntity
        const qb = createOneQueryBuilder(item)
        const repo = {
            createQueryBuilder: jest.fn().mockReturnValue(qb)
        }

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ClientProductVariantService,
                {
                    provide: getRepositoryToken(ProductVariantEntity),
                    useValue: repo
                }
            ]
        }).compile()

        service = module.get(ClientProductVariantService)

        const result = await service.findOne(7)

        expect(result).toBe(item)
        expect(qb.where).toHaveBeenCalledWith("productVariant.id = :id", {id: 7})
    })

    it("throws when product variant not found", async () => {
        const qb = createOneQueryBuilder(null)
        const repo = {
            createQueryBuilder: jest.fn().mockReturnValue(qb)
        }

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ClientProductVariantService,
                {
                    provide: getRepositoryToken(ProductVariantEntity),
                    useValue: repo
                }
            ]
        }).compile()

        service = module.get(ClientProductVariantService)

        await expect(service.findOne(999)).rejects.toBeInstanceOf(NotFoundException)
    })
})

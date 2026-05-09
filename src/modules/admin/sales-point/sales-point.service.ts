import {Injectable, NotFoundException} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {SalesPointEntity} from "./entities/sales-point.entity"
import {CreateSalesPointDto} from "./dto/create-sales-point.dto"
import {UpdateSalesPointDto} from "./dto/update-sales-point.dto"
import {IntegrationService} from "../integration/integration.service"
import {IntegrationProviderKey} from "../integration/entities/integration-setting.entity"

@Injectable()
export class SalesPointService {
    constructor(
        @InjectRepository(SalesPointEntity)
        private readonly repo: Repository<SalesPointEntity>,
        private readonly integrationService: IntegrationService
    ) {}

    private buildBranchIntegrationPayload(branch: SalesPointEntity, eventName: string) {
        return {
            eventId: `${eventName}-kokoro-sales-point-${branch.id}`,
            idempotencyKey: `${eventName}-kokoro-sales-point-${branch.id}-${Date.now()}`,
            externalId: `kokoro-sales-point-${branch.id}`,
            branchId: branch.id,
            title: branch.title,
            location: branch.location || null,
            createdAt: branch.createdAt
        }
    }

    private async enqueueDatraBranchEvent(branch: SalesPointEntity, eventName: string) {
        await this.integrationService.enqueue(
            IntegrationProviderKey.DATRA_CDP,
            eventName,
            this.buildBranchIntegrationPayload(branch, eventName)
        )
    }

    async create(dto: CreateSalesPointDto) {
        const branch = await this.repo.save(dto)
        await this.enqueueDatraBranchEvent(branch, "branch_created")
        return branch
    }

    findAll() {
        return this.repo.find()
    }

    findAllWithProductStorages() {
        return this.repo.find({
            relations: ["product_storages"],
            order: {id: "ASC"}
        })
    }

    findOne(id: number) {
        return this.repo.findOne({where: {id}})
    }

    async update(id: number, dto: UpdateSalesPointDto) {
        const existing = await this.repo.findOneBy({id})
        if (!existing) throw new NotFoundException("SalesPoint not found")

        const updated = this.repo.merge(existing, dto)
        const saved = await this.repo.save(updated)
        await this.enqueueDatraBranchEvent(saved, "branch_updated")
        return saved
    }

    remove(id: number) {
        return this.repo.delete(id)
    }
}

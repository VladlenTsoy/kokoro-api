import {Injectable} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {DeliveryTypeEntity} from "./entities/delivery-type.entity"
import {CreateDeliveryTypeDto} from "./dto/create-delivery-type.dto"
import {UpdateDeliveryTypeDto} from "./dto/update-delivery-type.dto"
import {CityEntity} from "../city/entities/city.entity"

@Injectable()
export class DeliveryTypeService {
    constructor(
        @InjectRepository(DeliveryTypeEntity)
        private readonly repo: Repository<DeliveryTypeEntity>,
        @InjectRepository(CityEntity)
        private readonly cityRepo: Repository<CityEntity>
    ) {}

    async create(dto: CreateDeliveryTypeDto) {
        const entity = this.repo.create({
            ...dto,
            city: dto.cityId ? await this.cityRepo.findOneBy({id: dto.cityId}) : null
        })
        return this.repo.save(entity)
    }

    findAll() {
        return this.repo.find({relations: ["city"]})
    }

    findOne(id: number) {
        return this.repo.findOne({where: {id}, relations: ["city"]})
    }

    async update(id: number, dto: UpdateDeliveryTypeDto) {
        const updateData: any = {...dto}

        if (dto.cityId !== undefined) {
            updateData.city = dto.cityId ? await this.cityRepo.findOneBy({id: dto.cityId}) : null
        }

        await this.repo.update(id, updateData)
        return this.findOne(id)
    }

    remove(id: number) {
        return this.repo.delete(id)
    }
}

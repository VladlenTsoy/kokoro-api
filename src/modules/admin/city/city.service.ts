import {Injectable} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {CityEntity} from "./entities/city.entity"
import {CountryEntity} from "../country/entities/country.entity"
import {CreateCityDto} from "./dto/create-city.dto"
import {UpdateCityDto} from "./dto/update-city.dto"

@Injectable()
export class CityService {
    constructor(
        @InjectRepository(CityEntity)
        private readonly repo: Repository<CityEntity>,
        @InjectRepository(CountryEntity)
        private readonly countryRepo: Repository<CountryEntity>
    ) {}

    async create(dto: CreateCityDto) {
        const country = await this.countryRepo.findOneBy({id: dto.countryId})

        const entity = this.repo.create({
            name: dto.name,
            position: dto.position,
            country
        })

        return this.repo.save(entity)
    }

    findAll() {
        return this.repo.find({relations: ["country"]})
    }

    findOne(id: number) {
        return this.repo.findOne({where: {id}, relations: ["country"]})
    }

    async update(id: number, dto: UpdateCityDto) {
        const updateData: any = {
            name: dto.name,
            position: dto.position
        }

        if (dto.countryId) {
            const country = await this.countryRepo.findOneBy({id: dto.countryId})
            updateData.country = country
        }

        await this.repo.update(id, updateData)
        return this.findOne(id)
    }

    remove(id: number) {
        return this.repo.delete(id)
    }
}

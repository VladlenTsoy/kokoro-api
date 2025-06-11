import {Injectable} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {CountryEntity} from "./entities/country.entity"
import {CreateCountryDto} from "./dto/create-country.dto"
import {UpdateCountryDto} from "./dto/update-country.dto"

@Injectable()
export class CountryService {
    constructor(
        @InjectRepository(CountryEntity)
        private readonly repo: Repository<CountryEntity>
    ) {}

    create(dto: CreateCountryDto) {
        return this.repo.save(dto)
    }

    findAll() {
        return this.repo.find()
    }

    findOne(id: number) {
        return this.repo.findOne({where: {id}})
    }

    update(id: number, dto: UpdateCountryDto) {
        return this.repo.update(id, dto)
    }

    remove(id: number) {
        return this.repo.delete(id)
    }
}

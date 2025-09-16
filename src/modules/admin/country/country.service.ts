import {Injectable, NotFoundException} from "@nestjs/common"
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

    /**
     * Error output not found
     * @private
     */
    private errorNotFound() {
        throw new NotFoundException("The country was not found")
    }

    create(dto: CreateCountryDto) {
        return this.repo.save(dto)
    }

    findAll() {
        return this.repo.find()
    }

    findOne(id: number) {
        return this.repo.findOne({where: {id}})
    }

    async update(id: number, dto: UpdateCountryDto) {
        const result = await this.repo.update(id, dto)
        if (result.affected === 0) return this.errorNotFound()

        return this.repo.findOne({where: {id}})
    }

    async remove(id: number) {
        const result = await this.repo.delete(id)
        if (result.affected === 0) return this.errorNotFound()

        return {message: "Country has been successfully removed"}
    }
}

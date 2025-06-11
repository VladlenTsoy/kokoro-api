import {Injectable} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {OrderAddressEntity} from "./entities/order-address.entity"
import {CreateOrderAddressDto} from "./dto/create-order-address.dto"
import {UpdateOrderAddressDto} from "./dto/update-order-address.dto"
import {OrderEntity} from "../order/entities/order.entity"
import {CityEntity} from "../city/entities/city.entity"
import {CountryEntity} from "../country/entities/country.entity"

@Injectable()
export class OrderAddressService {
    constructor(
        @InjectRepository(OrderAddressEntity)
        private readonly repo: Repository<OrderAddressEntity>,
        @InjectRepository(OrderEntity)
        private readonly orderRepo: Repository<OrderEntity>,
        @InjectRepository(CountryEntity)
        private readonly countryRepo: Repository<CountryEntity>,
        @InjectRepository(CityEntity)
        private readonly cityRepo: Repository<CityEntity>
    ) {}

    async create(dto: CreateOrderAddressDto) {
        const order = await this.orderRepo.findOneBy({id: dto.orderId})
        const country = dto.countryId ? await this.countryRepo.findOneBy({id: dto.countryId}) : null
        const city = dto.cityId ? await this.cityRepo.findOneBy({id: dto.cityId}) : null

        const entity = this.repo.create({
            ...dto,
            order,
            country,
            city
        })

        return this.repo.save(entity)
    }

    findAll() {
        return this.repo.find({relations: ["order", "country", "city"]})
    }

    findOne(id: number) {
        return this.repo.findOne({where: {id}, relations: ["order", "country", "city"]})
    }

    async update(id: number, dto: UpdateOrderAddressDto) {
        const updateData: any = {...dto}

        if (dto.orderId) {
            updateData.order = await this.orderRepo.findOneBy({id: dto.orderId})
        }

        if (dto.countryId !== undefined) {
            updateData.country = dto.countryId ? await this.countryRepo.findOneBy({id: dto.countryId}) : null
        }

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

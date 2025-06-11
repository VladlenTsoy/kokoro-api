import {Injectable} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {SourceEntity} from "./entities/source.entity"
import {CreateSourceDto} from "./dto/create-source.dto"
import {UpdateSourceDto} from "./dto/update-source.dto"

@Injectable()
export class SourceService {
    constructor(
        @InjectRepository(SourceEntity)
        private readonly repo: Repository<SourceEntity>
    ) {}

    create(dto: CreateSourceDto) {
        return this.repo.save(dto)
    }

    findAll() {
        return this.repo.find()
    }

    findOne(id: number) {
        return this.repo.findOne({where: {id}})
    }

    update(id: number, dto: UpdateSourceDto) {
        return this.repo.update(id, dto)
    }

    remove(id: number) {
        return this.repo.delete(id)
    }
}

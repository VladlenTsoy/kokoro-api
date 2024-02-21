import {Injectable, NotFoundException} from "@nestjs/common"
import {CreateSizeDto} from "./dto/create-size.dto"
import {UpdateSizeDto} from "./dto/update-size.dto"
import {InjectRepository} from "@nestjs/typeorm"
import {IsNull, Repository} from "typeorm"
import {SizeEntity} from "./entities/size.entity"

@Injectable()
export class SizeService {
    constructor(
        @InjectRepository(SizeEntity)
        private readonly sizeRepository: Repository<SizeEntity>
    ) {}

    /**
     * Error output not found
     * @private
     */
    private errorNotFound() {
        throw new NotFoundException("The size was not found")
    }

    async create(createSizeDto: CreateSizeDto) {
        const size = this.sizeRepository.create(createSizeDto)
        // Save color
        await this.sizeRepository.save(size)
        return size
    }

    findAll() {
        return this.sizeRepository.find({where: {deleted_at: IsNull()}})
    }

    async findOne(id: number) {
        const color = await this.sizeRepository.findOneBy({
            id,
            deleted_at: IsNull()
        })
        // Not found
        if (!color) this.errorNotFound()

        return color
    }

    async update(id: number, updateSizeDto: UpdateSizeDto) {
        const size = await this.sizeRepository.findOneBy({
            id,
            deleted_at: IsNull()
        })
        // Not found
        if (!size) this.errorNotFound()
        // Required field
        size.title = updateSizeDto.title

        return await this.sizeRepository.save(size)
    }

    async remove(id: number) {
        const size = await this.sizeRepository.findOneBy({
            id,
            deleted_at: IsNull()
        })
        // Not found size
        if (!size) this.errorNotFound()
        // Fields
        size.deleted_at = new Date()
        // Save
        await this.sizeRepository.save(size)
        // const size = await this.sizeRepository.delete(id)
        // Success message
        return {message: "Size has been successfully removed"}
    }
}

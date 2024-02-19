import {Injectable, NotFoundException} from "@nestjs/common"
import {CreateSizeDto} from "./dto/create-size.dto"
import {UpdateSizeDto} from "./dto/update-size.dto"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {SizeEntity} from "./entities/size.entity"

@Injectable()
export class SizeService {
    constructor(
        @InjectRepository(SizeEntity)
        private readonly sizeRepository: Repository<SizeEntity>
    ) {
    }

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
        return this.sizeRepository.find()
    }

    async findOne(id: number) {
        const color = await this.sizeRepository.findOneBy({id})
        // Not found
        if (!color) this.errorNotFound()

        return color
    }

    async update(id: number, updateSizeDto: UpdateSizeDto) {
        const size = await this.sizeRepository.findOneBy({id})
        // Not found
        if (!size) this.errorNotFound()
        // Required field
        size.title = updateSizeDto.title
        // Not required field
        if (updateSizeDto.is_hide)
            size.is_hide = updateSizeDto.is_hide

        return await this.sizeRepository.save(size)
    }

    async remove(id: number) {
        const size = await this.sizeRepository.delete(id)
        // Not found product category
        if (!size.affected) this.errorNotFound()
        // Success message
        return {message: "Size has been successfully removed"}
    }
}

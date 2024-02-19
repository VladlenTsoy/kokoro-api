import {Injectable, NotFoundException} from "@nestjs/common"
import {CreateColorDto} from "./dto/create-color.dto"
import {UpdateColorDto} from "./dto/update-color.dto"
import {ColorEntity} from "./entities/color.entity"
import {Repository} from "typeorm"
import {InjectRepository} from "@nestjs/typeorm"

@Injectable()
export class ColorService {
    constructor(
        @InjectRepository(ColorEntity)
        private readonly colorRepository: Repository<ColorEntity>
    ) {
    }

    /**
     * Error output not found
     * @private
     */
    private errorNotFound() {
        throw new NotFoundException("The color was not found")
    }

    async create(createColorDto: CreateColorDto) {
        const color = this.colorRepository.create(createColorDto)
        // Save color
        await this.colorRepository.save(color)
        return color
    }

    findAll() {
        return this.colorRepository.find()
    }

    async findOne(id: number) {
        const color = await this.colorRepository.findOneBy({id})
        // Not found product category
        if (!color) this.errorNotFound()

        return color
    }

    async update(id: number, updateColorDto: UpdateColorDto) {
        const color = await this.colorRepository.findOneBy({id})
        // Not found product category
        if (!color) this.errorNotFound()
        // Required field
        color.title = updateColorDto.title
        color.hex = updateColorDto.hex
        // Not required field
        if (updateColorDto.deleted_at)
            color.deleted_at = updateColorDto.deleted_at

        return await this.colorRepository.save(color)
    }

    async remove(id: number) {
        const color = await this.colorRepository.delete(id)
        // Not found product category
        if (!color.affected) this.errorNotFound()
        // Success message
        return {message: "Color has been successfully removed"}
    }
}

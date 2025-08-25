import {Injectable, NotFoundException} from "@nestjs/common"
import {CreateColorDto} from "./dto/create-color.dto"
import {UpdateColorDto} from "./dto/update-color.dto"
import {ColorEntity} from "./entities/color.entity"
import {Repository, IsNull} from "typeorm"
import {InjectRepository} from "@nestjs/typeorm"

@Injectable()
export class ColorService {
    constructor(
        @InjectRepository(ColorEntity)
        private readonly colorRepository: Repository<ColorEntity>
    ) {}

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
        return this.colorRepository.find({where: {deleted_at: IsNull()}})
    }

    async findOne(id: number) {
        const color = await this.colorRepository.findOneBy({
            id,
            deleted_at: IsNull()
        })
        // Not found color
        if (!color) this.errorNotFound()

        return color
    }

    async update(id: number, updateColorDto: UpdateColorDto) {
        const color = await this.colorRepository.findOneBy({
            id,
            deleted_at: IsNull()
        })
        // Not found color
        if (!color) this.errorNotFound()
        // Required fields
        color.title = updateColorDto.title
        color.hex = updateColorDto.hex

        return await this.colorRepository.save(color)
    }

    async remove(id: number) {
        const color = await this.colorRepository.findOneBy({
            id,
            deleted_at: IsNull()
        })
        // Not found color
        if (!color) this.errorNotFound()
        // Fields
        color.deleted_at = new Date()
        // Save
        await this.colorRepository.save(color)
        // Success message
        return {message: "Color has been successfully removed"}
    }
}

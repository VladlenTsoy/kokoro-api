import {Injectable} from "@nestjs/common"
import {CreateColorDto} from "./dto/create-color.dto"
import {UpdateColorDto} from "./dto/update-color.dto"
// import {ColorEntity} from "./entities/color.entity"

@Injectable()
export class ColorService {
    constructor(
        // @InjectRepository(ColorEntity)
        // private readonly colorRepository: EntityRepository<ColorEntity>
    ) {
    }

    create(createColorDto: CreateColorDto) {
        // const colorEntity = new ColorEntity()
        return " colorEntity"
    }

    findAll() {
        return `This action returns all color`
    }

    findOne(id: number) {
        return `This action returns a #${id} color`
    }

    update(id: number, updateColorDto: UpdateColorDto) {
        return `This action updates a #${id} color`
    }

    remove(id: number) {
        return `This action removes a #${id} color`
    }
}

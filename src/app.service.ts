import {Injectable} from "@nestjs/common"
import {CategoryEntity} from "./entities/category.entity"
import {InjectRepository} from "@mikro-orm/nestjs"
import {EntityRepository} from "@mikro-orm/mysql"

@Injectable()
export class AppService {
    constructor(@InjectRepository(CategoryEntity) private readonly authorRepository: EntityRepository<CategoryEntity>) {
    }

    async getHello(): Promise<string> {
        const author = new CategoryEntity("Верхняя одежда", null)
        // wrap(author).assign({title: "Верхняя одежда"})
        await this.authorRepository.persistAndFlush(author)

        return author.url
    }
}

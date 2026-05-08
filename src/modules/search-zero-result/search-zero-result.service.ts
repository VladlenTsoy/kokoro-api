import {Injectable} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {SearchZeroResultEntity} from "./entities/search-zero-result.entity"

@Injectable()
export class SearchZeroResultService {
    constructor(
        @InjectRepository(SearchZeroResultEntity)
        private readonly repository: Repository<SearchZeroResultEntity>
    ) {}

    private normalizeQuery(query: string) {
        return query.trim().replace(/\s+/g, " ").toLowerCase().slice(0, 160)
    }

    async record(query: string) {
        const normalizedQuery = this.normalizeQuery(query)
        if (normalizedQuery.length < 2) return {ok: true}

        await this.repository.query(
            `INSERT INTO search_zero_results (query, count, lastSearchedAt, createdAt, updatedAt)
             VALUES (?, 1, NOW(6), NOW(6), NOW(6))
             ON DUPLICATE KEY UPDATE count = count + 1, lastSearchedAt = NOW(6), updatedAt = NOW(6)`,
            [normalizedQuery]
        )

        return {ok: true}
    }

    findAll() {
        return this.repository.find({
            order: {
                count: "DESC",
                lastSearchedAt: "DESC"
            },
            take: 200
        })
    }
}

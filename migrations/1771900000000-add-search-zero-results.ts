import {MigrationInterface, QueryRunner} from "typeorm"

export class AddSearchZeroResults1771900000000 implements MigrationInterface {
    name = "AddSearchZeroResults1771900000000"

    public async up(queryRunner: QueryRunner): Promise<void> {
        const hasTable = await queryRunner.hasTable("search_zero_results")
        if (hasTable) return

        await queryRunner.query(`
            CREATE TABLE \`search_zero_results\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`query\` varchar(160) NOT NULL,
                \`count\` int NOT NULL DEFAULT 1,
                \`lastSearchedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_search_zero_results_query\` (\`query\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const hasTable = await queryRunner.hasTable("search_zero_results")
        if (hasTable) {
            await queryRunner.query("DROP TABLE `search_zero_results`")
        }
    }
}

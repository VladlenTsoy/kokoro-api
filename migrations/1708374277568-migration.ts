import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1708374277568 implements MigrationInterface {
    name = 'Migration1708374277568'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`colors\` CHANGE \`is_hide\` \`deleted_at\` tinyint NULL`);
        await queryRunner.query(`ALTER TABLE \`colors\` DROP COLUMN \`deleted_at\``);
        await queryRunner.query(`ALTER TABLE \`colors\` ADD \`deleted_at\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`product_categories\` CHANGE \`created_at\` \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`product_categories\` CHANGE \`created_at\` \`created_at\` timestamp(0) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`colors\` DROP COLUMN \`deleted_at\``);
        await queryRunner.query(`ALTER TABLE \`colors\` ADD \`deleted_at\` tinyint NULL`);
        await queryRunner.query(`ALTER TABLE \`colors\` CHANGE \`deleted_at\` \`is_hide\` tinyint NULL`);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1748374142295 implements MigrationInterface {
    name = 'Migration1748374142295'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`REL_0579dc0e91fee1ce420565003a\` ON \`product_color_sizes\``);
        await queryRunner.query(`DROP INDEX \`REL_ab5fd8f7c7e066c3126f6ac280\` ON \`product_colors\``);
        await queryRunner.query(`CREATE TABLE \`product_properties\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(200) NOT NULL, \`description\` text NOT NULL, \`is_global\` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`product_color_tags\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(20) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`product_categories\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`parent_category_id\` varchar(20) NULL, \`url\` varchar(255) NOT NULL, \`is_hide\` tinyint NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`products\` ADD \`category_id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`product_color_images\` ADD CONSTRAINT \`FK_0e383b9dff33cd88b0b91c8f79a\` FOREIGN KEY (\`product_color_id\`) REFERENCES \`product_colors\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`product_colors\` ADD CONSTRAINT \`FK_90213070102b149edd87ab1207e\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`product_colors\` DROP FOREIGN KEY \`FK_90213070102b149edd87ab1207e\``);
        await queryRunner.query(`ALTER TABLE \`product_color_images\` DROP FOREIGN KEY \`FK_0e383b9dff33cd88b0b91c8f79a\``);
        await queryRunner.query(`ALTER TABLE \`products\` DROP COLUMN \`category_id\``);
        await queryRunner.query(`DROP TABLE \`product_categories\``);
        await queryRunner.query(`DROP TABLE \`product_color_tags\``);
        await queryRunner.query(`DROP TABLE \`product_properties\``);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_ab5fd8f7c7e066c3126f6ac280\` ON \`product_colors\` (\`color_id\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_0579dc0e91fee1ce420565003a\` ON \`product_color_sizes\` (\`size_id\`)`);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1708638304790 implements MigrationInterface {
    name = 'Migration1708638304790'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`colors\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(20) NOT NULL, \`hex\` varchar(8) NOT NULL, \`deleted_at\` timestamp NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`product_colors\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(50) NOT NULL, \`price\` int NOT NULL, \`product_id\` int NOT NULL, \`color_id\` int NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`REL_ab5fd8f7c7e066c3126f6ac280\` (\`color_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`product_sizes\` (\`id\` int NOT NULL AUTO_INCREMENT, \`product_color_id\` int NOT NULL, \`size_id\` int NOT NULL, \`cost_price\` int NOT NULL, \`qty\` int NOT NULL, \`min_qty\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`products\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`sizes\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(20) NOT NULL, \`deleted_at\` timestamp NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`product_colors\` ADD CONSTRAINT \`FK_ab5fd8f7c7e066c3126f6ac280b\` FOREIGN KEY (\`color_id\`) REFERENCES \`colors\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`product_colors\` DROP FOREIGN KEY \`FK_ab5fd8f7c7e066c3126f6ac280b\``);
        await queryRunner.query(`DROP TABLE \`sizes\``);
        await queryRunner.query(`DROP TABLE \`products\``);
        await queryRunner.query(`DROP TABLE \`product_sizes\``);
        await queryRunner.query(`DROP INDEX \`REL_ab5fd8f7c7e066c3126f6ac280\` ON \`product_colors\``);
        await queryRunner.query(`DROP TABLE \`product_colors\``);
        await queryRunner.query(`DROP TABLE \`colors\``);
    }

}

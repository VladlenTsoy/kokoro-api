import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1708454890552 implements MigrationInterface {
    name = 'Migration1708454890552'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`client_addresses\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`full_name\` varchar(255) NOT NULL, \`phone\` varchar(255) NOT NULL, \`country\` varchar(255) NULL, \`city\` varchar(255) NULL, \`address\` varchar(255) NULL, \`position\` json NULL, \`client_id\` int NOT NULL, \`created_at\` timestamp NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`clients\` (\`id\` int NOT NULL AUTO_INCREMENT, \`phone\` varchar(255) NULL, \`full_name\` varchar(255) NOT NULL, \`email\` varchar(255) NULL, \`password\` varchar(255) NULL, \`source_id\` int NOT NULL, \`created_at\` timestamp NOT NULL, UNIQUE INDEX \`IDX_b48860677afe62cd96e1265948\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`product_color_measurements\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` int NOT NULL, \`description\` json NOT NULL, \`product_color_id\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`product_color_discounts\` (\`id\` int NOT NULL AUTO_INCREMENT, \`discount\` float NOT NULL, \`product_color_id\` int NOT NULL, \`end_at\` datetime NOT NULL, \`created_at\` timestamp NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`product_color_sizes\` (\`id\` int NOT NULL AUTO_INCREMENT, \`product_color_id\` int NOT NULL, \`size_id\` varchar(255) NOT NULL, \`cost_price\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`product_color_statuses\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`position\` int NOT NULL, \`is_default\` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`product_colors\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`price\` int NOT NULL, \`product_id\` int NOT NULL, \`color_id\` int NOT NULL, \`status_id\` int NOT NULL, \`is_new\` tinyint NULL, \`is_hide\` tinyint NULL, \`created_at\` timestamp NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`product_properties\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`description\` varchar(255) NOT NULL, \`is_global\` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`product_storages\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`products\` (\`id\` int NOT NULL AUTO_INCREMENT, \`category_id\` int NOT NULL, \`created_at\` timestamp NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`sales_points\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`location\` json NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`colors\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(20) NOT NULL, \`hex\` varchar(8) NOT NULL, \`deleted_at\` timestamp NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`product_color_tags\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`product_categories\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`parent_category_id\` int NULL, \`is_hide\` tinyint NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`sizes\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(20) NOT NULL, \`deleted_at\` timestamp NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`sizes\``);
        await queryRunner.query(`DROP TABLE \`product_categories\``);
        await queryRunner.query(`DROP TABLE \`product_color_tags\``);
        await queryRunner.query(`DROP TABLE \`colors\``);
        await queryRunner.query(`DROP TABLE \`sales_points\``);
        await queryRunner.query(`DROP TABLE \`products\``);
        await queryRunner.query(`DROP TABLE \`product_storages\``);
        await queryRunner.query(`DROP TABLE \`product_properties\``);
        await queryRunner.query(`DROP TABLE \`product_colors\``);
        await queryRunner.query(`DROP TABLE \`product_color_statuses\``);
        await queryRunner.query(`DROP TABLE \`product_color_sizes\``);
        await queryRunner.query(`DROP TABLE \`product_color_discounts\``);
        await queryRunner.query(`DROP TABLE \`product_color_measurements\``);
        await queryRunner.query(`DROP INDEX \`IDX_b48860677afe62cd96e1265948\` ON \`clients\``);
        await queryRunner.query(`DROP TABLE \`clients\``);
        await queryRunner.query(`DROP TABLE \`client_addresses\``);
    }

}

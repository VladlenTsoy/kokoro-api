import {MigrationInterface, QueryRunner} from "typeorm"

export class AddAdminRefreshTokens1769801000000 implements MigrationInterface {
    name = "AddAdminRefreshTokens1769801000000"

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            "CREATE TABLE `admin_refresh_tokens` (`id` int NOT NULL AUTO_INCREMENT, `tokenHash` varchar(255) NOT NULL, `tokenSalt` varchar(255) NOT NULL, `expiresAt` datetime NOT NULL, `revokedAt` datetime NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `employeeId` int NOT NULL, INDEX `IDX_admin_refresh_tokens_employee` (`employeeId`), INDEX `IDX_admin_refresh_tokens_expires` (`expiresAt`), PRIMARY KEY (`id`)) ENGINE=InnoDB"
        )

        await queryRunner.query(
            "ALTER TABLE `admin_refresh_tokens` ADD CONSTRAINT `FK_admin_refresh_tokens_employee` FOREIGN KEY (`employeeId`) REFERENCES `admin_employees`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION"
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `admin_refresh_tokens` DROP FOREIGN KEY `FK_admin_refresh_tokens_employee`")
        await queryRunner.query("DROP INDEX `IDX_admin_refresh_tokens_expires` ON `admin_refresh_tokens`")
        await queryRunner.query("DROP INDEX `IDX_admin_refresh_tokens_employee` ON `admin_refresh_tokens`")
        await queryRunner.query("DROP TABLE `admin_refresh_tokens`")
    }
}

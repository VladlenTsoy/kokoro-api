import {MigrationInterface, QueryRunner} from "typeorm"

export class AddClientAuthAndTelegram1771000000000 implements MigrationInterface {
    name = "AddClientAuthAndTelegram1771000000000"

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `clients` DROP INDEX `IDX_clients_phone`")
        await queryRunner.query("ALTER TABLE `clients` CHANGE `phone` `phone` varchar(50) NULL")
        await queryRunner.query("ALTER TABLE `clients` ADD UNIQUE INDEX `IDX_clients_phone` (`phone`)")

        await queryRunner.query("ALTER TABLE `clients` ADD `telegramId` varchar(64) NULL")
        await queryRunner.query("ALTER TABLE `clients` ADD `telegramUsername` varchar(255) NULL")
        await queryRunner.query("ALTER TABLE `clients` ADD `telegramFirstName` varchar(255) NULL")
        await queryRunner.query("ALTER TABLE `clients` ADD `telegramLastName` varchar(255) NULL")
        await queryRunner.query("ALTER TABLE `clients` ADD `telegramPhotoUrl` varchar(1024) NULL")
        await queryRunner.query("ALTER TABLE `clients` ADD `lastLoginAt` datetime NULL")
        await queryRunner.query("ALTER TABLE `clients` ADD `isActive` tinyint NOT NULL DEFAULT 1")
        await queryRunner.query("CREATE UNIQUE INDEX `IDX_clients_telegram_id` ON `clients` (`telegramId`)")

        await queryRunner.query(
            "CREATE TABLE `client_refresh_tokens` (`id` int NOT NULL AUTO_INCREMENT, `tokenHash` varchar(255) NOT NULL, `tokenSalt` varchar(255) NOT NULL, `expiresAt` datetime NOT NULL, `revokedAt` datetime NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `clientId` int NOT NULL, INDEX `IDX_client_refresh_tokens_client` (`clientId`), INDEX `IDX_client_refresh_tokens_expires` (`expiresAt`), PRIMARY KEY (`id`)) ENGINE=InnoDB"
        )

        await queryRunner.query(
            "ALTER TABLE `client_refresh_tokens` ADD CONSTRAINT `FK_client_refresh_tokens_client` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION"
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `client_refresh_tokens` DROP FOREIGN KEY `FK_client_refresh_tokens_client`")
        await queryRunner.query("DROP INDEX `IDX_client_refresh_tokens_expires` ON `client_refresh_tokens`")
        await queryRunner.query("DROP INDEX `IDX_client_refresh_tokens_client` ON `client_refresh_tokens`")
        await queryRunner.query("DROP TABLE `client_refresh_tokens`")

        await queryRunner.query("DROP INDEX `IDX_clients_telegram_id` ON `clients`")
        await queryRunner.query("ALTER TABLE `clients` DROP COLUMN `isActive`")
        await queryRunner.query("ALTER TABLE `clients` DROP COLUMN `lastLoginAt`")
        await queryRunner.query("ALTER TABLE `clients` DROP COLUMN `telegramPhotoUrl`")
        await queryRunner.query("ALTER TABLE `clients` DROP COLUMN `telegramLastName`")
        await queryRunner.query("ALTER TABLE `clients` DROP COLUMN `telegramFirstName`")
        await queryRunner.query("ALTER TABLE `clients` DROP COLUMN `telegramUsername`")
        await queryRunner.query("ALTER TABLE `clients` DROP COLUMN `telegramId`")

        await queryRunner.query("ALTER TABLE `clients` DROP INDEX `IDX_clients_phone`")
        await queryRunner.query("ALTER TABLE `clients` CHANGE `phone` `phone` varchar(50) NOT NULL")
        await queryRunner.query("ALTER TABLE `clients` ADD UNIQUE INDEX `IDX_clients_phone` (`phone`)")
    }
}

import {MigrationInterface, QueryRunner} from "typeorm"

export class AddPromoCodesAndClientBonuses1771400000000 implements MigrationInterface {
    name = "AddPromoCodesAndClientBonuses1771400000000"

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `clients` ADD `bonusBalance` int NOT NULL DEFAULT 0")

        await queryRunner.query("ALTER TABLE `orders` ADD `promoCode` varchar(64) NULL")
        await queryRunner.query("ALTER TABLE `orders` ADD `promoDiscount` int NOT NULL DEFAULT 0")
        await queryRunner.query("ALTER TABLE `orders` ADD `bonusSpent` int NOT NULL DEFAULT 0")
        await queryRunner.query("ALTER TABLE `orders` ADD `bonusEarned` int NOT NULL DEFAULT 0")
        await queryRunner.query("ALTER TABLE `orders` ADD `bonusesCreditedAt` datetime NULL")

        await queryRunner.query(
            "CREATE TABLE `promo_codes` (`id` int NOT NULL AUTO_INCREMENT, `code` varchar(64) NOT NULL, `discountType` enum ('percent', 'fixed') NOT NULL, `discountValue` int NOT NULL, `minOrderTotal` int NOT NULL DEFAULT 0, `usageLimit` int NULL, `usedCount` int NOT NULL DEFAULT 0, `startsAt` datetime NULL, `endsAt` datetime NULL, `isActive` tinyint NOT NULL DEFAULT 1, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX `IDX_promo_codes_code` (`code`), PRIMARY KEY (`id`)) ENGINE=InnoDB"
        )

        await queryRunner.query(
            "CREATE TABLE `client_bonus_transactions` (`id` int NOT NULL AUTO_INCREMENT, `type` enum ('earn', 'spend', 'refund', 'adjust') NOT NULL, `amount` int NOT NULL, `comment` varchar(255) NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `clientId` int NULL, `orderId` int NULL, INDEX `IDX_client_bonus_transactions_client` (`clientId`), INDEX `IDX_client_bonus_transactions_order` (`orderId`), PRIMARY KEY (`id`)) ENGINE=InnoDB"
        )
        await queryRunner.query(
            "ALTER TABLE `client_bonus_transactions` ADD CONSTRAINT `FK_client_bonus_transactions_client` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION"
        )
        await queryRunner.query(
            "ALTER TABLE `client_bonus_transactions` ADD CONSTRAINT `FK_client_bonus_transactions_order` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION"
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `client_bonus_transactions` DROP FOREIGN KEY `FK_client_bonus_transactions_order`")
        await queryRunner.query("ALTER TABLE `client_bonus_transactions` DROP FOREIGN KEY `FK_client_bonus_transactions_client`")
        await queryRunner.query("DROP INDEX `IDX_client_bonus_transactions_order` ON `client_bonus_transactions`")
        await queryRunner.query("DROP INDEX `IDX_client_bonus_transactions_client` ON `client_bonus_transactions`")
        await queryRunner.query("DROP TABLE `client_bonus_transactions`")

        await queryRunner.query("DROP INDEX `IDX_promo_codes_code` ON `promo_codes`")
        await queryRunner.query("DROP TABLE `promo_codes`")

        await queryRunner.query("ALTER TABLE `orders` DROP COLUMN `bonusesCreditedAt`")
        await queryRunner.query("ALTER TABLE `orders` DROP COLUMN `bonusEarned`")
        await queryRunner.query("ALTER TABLE `orders` DROP COLUMN `bonusSpent`")
        await queryRunner.query("ALTER TABLE `orders` DROP COLUMN `promoDiscount`")
        await queryRunner.query("ALTER TABLE `orders` DROP COLUMN `promoCode`")

        await queryRunner.query("ALTER TABLE `clients` DROP COLUMN `bonusBalance`")
    }
}

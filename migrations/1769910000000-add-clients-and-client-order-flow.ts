import {MigrationInterface, QueryRunner} from "typeorm"

export class AddClientsAndClientOrderFlow1769910000000 implements MigrationInterface {
    name = "AddClientsAndClientOrderFlow1769910000000"

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            "CREATE TABLE `clients` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, `phone` varchar(50) NOT NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX `IDX_clients_phone` (`phone`), PRIMARY KEY (`id`)) ENGINE=InnoDB"
        )

        await queryRunner.query(
            "CREATE TABLE `client_addresses` (`id` int NOT NULL AUTO_INCREMENT, `address` varchar(255) NOT NULL, `location` json NULL, `locationHash` varchar(255) NOT NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `clientId` int NOT NULL, UNIQUE INDEX `IDX_client_addresses_client_location` (`clientId`, `locationHash`), PRIMARY KEY (`id`)) ENGINE=InnoDB"
        )

        await queryRunner.query("ALTER TABLE `orders` ADD `clientId` int NULL")
        await queryRunner.query("ALTER TABLE `orders` ADD `clientAddressId` int NULL")
        await queryRunner.query("CREATE INDEX `IDX_orders_client_id` ON `orders` (`clientId`)")
        await queryRunner.query("CREATE INDEX `IDX_orders_client_address_id` ON `orders` (`clientAddressId`)")

        await queryRunner.query("ALTER TABLE `order_items` CHANGE `sizeId` `sizeId` int NULL")

        await queryRunner.query(
            "ALTER TABLE `client_addresses` ADD CONSTRAINT `FK_client_addresses_client` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION"
        )
        await queryRunner.query(
            "ALTER TABLE `orders` ADD CONSTRAINT `FK_orders_client` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION"
        )
        await queryRunner.query(
            "ALTER TABLE `orders` ADD CONSTRAINT `FK_orders_client_address` FOREIGN KEY (`clientAddressId`) REFERENCES `client_addresses`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION"
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `orders` DROP FOREIGN KEY `FK_orders_client_address`")
        await queryRunner.query("ALTER TABLE `orders` DROP FOREIGN KEY `FK_orders_client`")
        await queryRunner.query("ALTER TABLE `client_addresses` DROP FOREIGN KEY `FK_client_addresses_client`")

        await queryRunner.query("ALTER TABLE `order_items` CHANGE `sizeId` `sizeId` int NOT NULL")

        await queryRunner.query("DROP INDEX `IDX_orders_client_address_id` ON `orders`")
        await queryRunner.query("DROP INDEX `IDX_orders_client_id` ON `orders`")
        await queryRunner.query("ALTER TABLE `orders` DROP COLUMN `clientAddressId`")
        await queryRunner.query("ALTER TABLE `orders` DROP COLUMN `clientId`")

        await queryRunner.query("DROP INDEX `IDX_client_addresses_client_location` ON `client_addresses`")
        await queryRunner.query("DROP TABLE `client_addresses`")

        await queryRunner.query("DROP INDEX `IDX_clients_phone` ON `clients`")
        await queryRunner.query("DROP TABLE `clients`")
    }
}

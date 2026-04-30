import {MigrationInterface, QueryRunner} from "typeorm"

export class AddOrderLifecycleAndClientCabinet1771200000000 implements MigrationInterface {
    name = "AddOrderLifecycleAndClientCabinet1771200000000"

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `orders` ADD `orderNumber` varchar(32) NULL")
        await queryRunner.query("ALTER TABLE `orders` ADD UNIQUE INDEX `IDX_orders_order_number` (`orderNumber`)")
        await queryRunner.query("ALTER TABLE `orders` ADD `assignedEmployeeId` int NULL")
        await queryRunner.query("CREATE INDEX `IDX_orders_assigned_employee` ON `orders` (`assignedEmployeeId`)")
        await queryRunner.query(
            "ALTER TABLE `orders` ADD `paymentStatus` enum ('pending', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'pending'"
        )
        await queryRunner.query(
            "ALTER TABLE `orders` ADD `deliveryStatus` enum ('pending', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending'"
        )
        await queryRunner.query("ALTER TABLE `orders` ADD `subtotal` int NOT NULL DEFAULT 0")
        await queryRunner.query("ALTER TABLE `orders` ADD `discountTotal` int NOT NULL DEFAULT 0")
        await queryRunner.query("ALTER TABLE `orders` ADD `deliveryPrice` int NOT NULL DEFAULT 0")
        await queryRunner.query("ALTER TABLE `orders` ADD `cancelReason` varchar(255) NULL")
        await queryRunner.query("ALTER TABLE `orders` ADD `accessToken` varchar(96) NULL")
        await queryRunner.query("ALTER TABLE `orders` ADD UNIQUE INDEX `IDX_orders_access_token` (`accessToken`)")
        await queryRunner.query("ALTER TABLE `orders` ADD `confirmedAt` datetime NULL")
        await queryRunner.query("ALTER TABLE `orders` ADD `completedAt` datetime NULL")
        await queryRunner.query("ALTER TABLE `orders` ADD `cancelledAt` datetime NULL")
        await queryRunner.query(
            "ALTER TABLE `orders` ADD `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)"
        )
        await queryRunner.query(
            "UPDATE `orders` SET `orderNumber` = CONCAT('KO-', LPAD(`id`, 6, '0')), `subtotal` = `total` WHERE `orderNumber` IS NULL"
        )
        await queryRunner.query(
            "ALTER TABLE `orders` ADD CONSTRAINT `FK_orders_assigned_employee` FOREIGN KEY (`assignedEmployeeId`) REFERENCES `admin_employees`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION"
        )

        await queryRunner.query("ALTER TABLE `order_items` ADD `productName` varchar(255) NULL")
        await queryRunner.query("ALTER TABLE `order_items` ADD `variantName` varchar(255) NULL")
        await queryRunner.query("ALTER TABLE `order_items` ADD `sku` varchar(64) NULL")
        await queryRunner.query("ALTER TABLE `order_items` ADD `colorName` varchar(50) NULL")
        await queryRunner.query("ALTER TABLE `order_items` ADD `sizeName` varchar(50) NULL")
        await queryRunner.query("ALTER TABLE `order_items` ADD `imageUrl` varchar(1024) NULL")
        await queryRunner.query("ALTER TABLE `order_items` ADD `unitPrice` int NOT NULL DEFAULT 0")
        await queryRunner.query("ALTER TABLE `order_items` ADD `finalUnitPrice` int NOT NULL DEFAULT 0")
        await queryRunner.query("ALTER TABLE `order_items` ADD `lineTotal` int NOT NULL DEFAULT 0")
        await queryRunner.query(
            "UPDATE `order_items` SET `unitPrice` = `price`, `finalUnitPrice` = GREATEST(`price` - `discount`, 0), `lineTotal` = GREATEST(`price` - `discount`, 0) * `qty`"
        )

        await queryRunner.query("ALTER TABLE `order_status_histories` ADD `employeeId` int NULL")
        await queryRunner.query("ALTER TABLE `order_status_histories` ADD `comment` varchar(255) NULL")
        await queryRunner.query("ALTER TABLE `order_status_histories` ADD `visibleForClient` tinyint NOT NULL DEFAULT 1")
        await queryRunner.query("CREATE INDEX `IDX_order_status_histories_employee` ON `order_status_histories` (`employeeId`)")
        await queryRunner.query(
            "ALTER TABLE `order_status_histories` ADD CONSTRAINT `FK_order_status_histories_employee` FOREIGN KEY (`employeeId`) REFERENCES `admin_employees`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION"
        )

        await queryRunner.query(
            "CREATE TABLE `order_comments` (`id` int NOT NULL AUTO_INCREMENT, `message` text NOT NULL, `visibleForClient` tinyint NOT NULL DEFAULT 0, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `orderId` int NULL, `employeeId` int NULL, INDEX `IDX_order_comments_order` (`orderId`), INDEX `IDX_order_comments_employee` (`employeeId`), PRIMARY KEY (`id`)) ENGINE=InnoDB"
        )
        await queryRunner.query(
            "ALTER TABLE `order_comments` ADD CONSTRAINT `FK_order_comments_order` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION"
        )
        await queryRunner.query(
            "ALTER TABLE `order_comments` ADD CONSTRAINT `FK_order_comments_employee` FOREIGN KEY (`employeeId`) REFERENCES `admin_employees`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION"
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `order_comments` DROP FOREIGN KEY `FK_order_comments_employee`")
        await queryRunner.query("ALTER TABLE `order_comments` DROP FOREIGN KEY `FK_order_comments_order`")
        await queryRunner.query("DROP INDEX `IDX_order_comments_employee` ON `order_comments`")
        await queryRunner.query("DROP INDEX `IDX_order_comments_order` ON `order_comments`")
        await queryRunner.query("DROP TABLE `order_comments`")

        await queryRunner.query("ALTER TABLE `order_status_histories` DROP FOREIGN KEY `FK_order_status_histories_employee`")
        await queryRunner.query("DROP INDEX `IDX_order_status_histories_employee` ON `order_status_histories`")
        await queryRunner.query("ALTER TABLE `order_status_histories` DROP COLUMN `visibleForClient`")
        await queryRunner.query("ALTER TABLE `order_status_histories` DROP COLUMN `comment`")
        await queryRunner.query("ALTER TABLE `order_status_histories` DROP COLUMN `employeeId`")

        await queryRunner.query("ALTER TABLE `order_items` DROP COLUMN `lineTotal`")
        await queryRunner.query("ALTER TABLE `order_items` DROP COLUMN `finalUnitPrice`")
        await queryRunner.query("ALTER TABLE `order_items` DROP COLUMN `unitPrice`")
        await queryRunner.query("ALTER TABLE `order_items` DROP COLUMN `imageUrl`")
        await queryRunner.query("ALTER TABLE `order_items` DROP COLUMN `sizeName`")
        await queryRunner.query("ALTER TABLE `order_items` DROP COLUMN `colorName`")
        await queryRunner.query("ALTER TABLE `order_items` DROP COLUMN `sku`")
        await queryRunner.query("ALTER TABLE `order_items` DROP COLUMN `variantName`")
        await queryRunner.query("ALTER TABLE `order_items` DROP COLUMN `productName`")

        await queryRunner.query("ALTER TABLE `orders` DROP FOREIGN KEY `FK_orders_assigned_employee`")
        await queryRunner.query("ALTER TABLE `orders` DROP COLUMN `updatedAt`")
        await queryRunner.query("ALTER TABLE `orders` DROP COLUMN `cancelledAt`")
        await queryRunner.query("ALTER TABLE `orders` DROP COLUMN `completedAt`")
        await queryRunner.query("ALTER TABLE `orders` DROP COLUMN `confirmedAt`")
        await queryRunner.query("DROP INDEX `IDX_orders_access_token` ON `orders`")
        await queryRunner.query("ALTER TABLE `orders` DROP COLUMN `accessToken`")
        await queryRunner.query("ALTER TABLE `orders` DROP COLUMN `cancelReason`")
        await queryRunner.query("ALTER TABLE `orders` DROP COLUMN `deliveryPrice`")
        await queryRunner.query("ALTER TABLE `orders` DROP COLUMN `discountTotal`")
        await queryRunner.query("ALTER TABLE `orders` DROP COLUMN `subtotal`")
        await queryRunner.query("ALTER TABLE `orders` DROP COLUMN `deliveryStatus`")
        await queryRunner.query("ALTER TABLE `orders` DROP COLUMN `paymentStatus`")
        await queryRunner.query("DROP INDEX `IDX_orders_assigned_employee` ON `orders`")
        await queryRunner.query("ALTER TABLE `orders` DROP COLUMN `assignedEmployeeId`")
        await queryRunner.query("DROP INDEX `IDX_orders_order_number` ON `orders`")
        await queryRunner.query("ALTER TABLE `orders` DROP COLUMN `orderNumber`")
    }
}

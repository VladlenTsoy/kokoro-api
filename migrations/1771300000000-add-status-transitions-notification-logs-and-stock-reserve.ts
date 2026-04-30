import {MigrationInterface, QueryRunner} from "typeorm"

export class AddStatusTransitionsNotificationLogsAndStockReserve1771300000000 implements MigrationInterface {
    name = "AddStatusTransitionsNotificationLogsAndStockReserve1771300000000"

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `product_variant_sizes` ADD `reservedQty` int NOT NULL DEFAULT 0")
        await queryRunner.query("ALTER TABLE `product_variant_sizes` ADD `soldQty` int NOT NULL DEFAULT 0")

        await queryRunner.query(
            "CREATE TABLE `order_status_transitions` (`id` int NOT NULL AUTO_INCREMENT, `isActive` tinyint NOT NULL DEFAULT 1, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `fromStatusId` int NULL, `toStatusId` int NULL, UNIQUE INDEX `UQ_order_status_transition` (`fromStatusId`, `toStatusId`), PRIMARY KEY (`id`)) ENGINE=InnoDB"
        )
        await queryRunner.query(
            "ALTER TABLE `order_status_transitions` ADD CONSTRAINT `FK_order_status_transitions_from` FOREIGN KEY (`fromStatusId`) REFERENCES `order_statuses`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION"
        )
        await queryRunner.query(
            "ALTER TABLE `order_status_transitions` ADD CONSTRAINT `FK_order_status_transitions_to` FOREIGN KEY (`toStatusId`) REFERENCES `order_statuses`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION"
        )

        await queryRunner.query(
            "CREATE TABLE `order_notification_logs` (`id` int NOT NULL AUTO_INCREMENT, `type` enum ('sms', 'email', 'push', 'telegram', 'webhook') NOT NULL, `sendTo` enum ('client', 'manager', 'courier', 'admin') NOT NULL, `recipient` varchar(255) NULL, `message` text NOT NULL, `statusValue` enum ('queued', 'sent', 'failed', 'skipped') NOT NULL DEFAULT 'queued', `error` text NULL, `sentAt` datetime NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `orderId` int NULL, `statusId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB"
        )
        await queryRunner.query("CREATE INDEX `IDX_order_notification_logs_order` ON `order_notification_logs` (`orderId`)")
        await queryRunner.query("CREATE INDEX `IDX_order_notification_logs_status` ON `order_notification_logs` (`statusId`)")
        await queryRunner.query(
            "ALTER TABLE `order_notification_logs` ADD CONSTRAINT `FK_order_notification_logs_order` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION"
        )
        await queryRunner.query(
            "ALTER TABLE `order_notification_logs` ADD CONSTRAINT `FK_order_notification_logs_status` FOREIGN KEY (`statusId`) REFERENCES `order_statuses`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION"
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `order_notification_logs` DROP FOREIGN KEY `FK_order_notification_logs_status`")
        await queryRunner.query("ALTER TABLE `order_notification_logs` DROP FOREIGN KEY `FK_order_notification_logs_order`")
        await queryRunner.query("DROP INDEX `IDX_order_notification_logs_status` ON `order_notification_logs`")
        await queryRunner.query("DROP INDEX `IDX_order_notification_logs_order` ON `order_notification_logs`")
        await queryRunner.query("DROP TABLE `order_notification_logs`")

        await queryRunner.query("ALTER TABLE `order_status_transitions` DROP FOREIGN KEY `FK_order_status_transitions_to`")
        await queryRunner.query("ALTER TABLE `order_status_transitions` DROP FOREIGN KEY `FK_order_status_transitions_from`")
        await queryRunner.query("DROP INDEX `UQ_order_status_transition` ON `order_status_transitions`")
        await queryRunner.query("DROP TABLE `order_status_transitions`")

        await queryRunner.query("ALTER TABLE `product_variant_sizes` DROP COLUMN `soldQty`")
        await queryRunner.query("ALTER TABLE `product_variant_sizes` DROP COLUMN `reservedQty`")
    }
}

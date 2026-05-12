import {MigrationInterface, QueryRunner} from "typeorm"

export class AddPosFoundation1772200000000 implements MigrationInterface {
    name = "AddPosFoundation1772200000000"

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`pos_devices\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`title\` varchar(120) NOT NULL,
                \`deviceCode\` varchar(120) NULL,
                \`isActive\` tinyint NOT NULL DEFAULT 1,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`salesPointId\` int NULL,
                UNIQUE INDEX \`IDX_pos_devices_device_code\` (\`deviceCode\`),
                INDEX \`IDX_pos_devices_sales_point\` (\`salesPointId\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `)

        await queryRunner.query(`
            CREATE TABLE \`pos_shifts\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`status\` enum ('open', 'closed', 'cancelled') NOT NULL DEFAULT 'open',
                \`openedAt\` datetime NOT NULL,
                \`closedAt\` datetime NULL,
                \`openingCashAmount\` int NOT NULL DEFAULT 0,
                \`closingCashAmount\` int NOT NULL DEFAULT 0,
                \`expectedCashAmount\` int NOT NULL DEFAULT 0,
                \`cashDifference\` int NOT NULL DEFAULT 0,
                \`closeComment\` varchar(255) NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`employeeId\` int NOT NULL,
                \`salesPointId\` int NOT NULL,
                \`deviceId\` int NULL,
                INDEX \`IDX_pos_shifts_employee_status\` (\`employeeId\`, \`status\`),
                INDEX \`IDX_pos_shifts_sales_point_status\` (\`salesPointId\`, \`status\`),
                INDEX \`IDX_pos_shifts_device\` (\`deviceId\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `)

        await queryRunner.query(`
            CREATE TABLE \`pos_shift_events\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`type\` enum ('open', 'close', 'cash_in', 'cash_out', 'sale', 'refund', 'cancel', 'manager_override') NOT NULL,
                \`payload\` json NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`shiftId\` int NOT NULL,
                \`employeeId\` int NULL,
                INDEX \`IDX_pos_shift_events_shift\` (\`shiftId\`),
                INDEX \`IDX_pos_shift_events_employee\` (\`employeeId\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `)

        await queryRunner.query(`
            CREATE TABLE \`admin_employee_sales_points\` (
                \`employee_id\` int NOT NULL,
                \`sales_point_id\` int NOT NULL,
                INDEX \`IDX_admin_employee_sales_points_employee\` (\`employee_id\`),
                INDEX \`IDX_admin_employee_sales_points_sales_point\` (\`sales_point_id\`),
                PRIMARY KEY (\`employee_id\`, \`sales_point_id\`)
            ) ENGINE=InnoDB
        `)

        await queryRunner.query(`
            CREATE TABLE \`product_barcodes\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`code\` varchar(120) NOT NULL,
                \`type\` enum ('barcode', 'qr', 'internal') NOT NULL DEFAULT 'barcode',
                \`isActive\` tinyint NOT NULL DEFAULT 1,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`productVariantId\` int NOT NULL,
                \`productVariantSizeId\` int NULL,
                UNIQUE INDEX \`IDX_product_barcodes_code_unique\` (\`code\`),
                INDEX \`IDX_product_barcodes_variant\` (\`productVariantId\`),
                INDEX \`IDX_product_barcodes_size\` (\`productVariantSizeId\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `)

        await queryRunner.query(`
            CREATE TABLE \`pos_payments\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`amount\` int NOT NULL,
                \`status\` enum ('pending', 'paid', 'failed', 'refunded', 'voided') NOT NULL DEFAULT 'pending',
                \`idempotencyKey\` varchar(120) NULL,
                \`providerRef\` varchar(120) NULL,
                \`paidAt\` datetime NULL,
                \`refundedAt\` datetime NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`orderId\` int NOT NULL,
                \`shiftId\` int NOT NULL,
                \`methodId\` int NOT NULL,
                UNIQUE INDEX \`IDX_pos_payments_idempotency\` (\`idempotencyKey\`),
                INDEX \`IDX_pos_payments_order\` (\`orderId\`),
                INDEX \`IDX_pos_payments_shift\` (\`shiftId\`),
                INDEX \`IDX_pos_payments_method\` (\`methodId\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `)

        await queryRunner.query(`
            CREATE TABLE \`pos_receipts\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`receiptNumber\` varchar(64) NOT NULL,
                \`status\` enum ('draft', 'printed', 'sent', 'fiscalized', 'failed') NOT NULL DEFAULT 'draft',
                \`fiscalProviderRef\` varchar(120) NULL,
                \`payload\` json NULL,
                \`printedAt\` datetime NULL,
                \`sentAt\` datetime NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`orderId\` int NOT NULL,
                UNIQUE INDEX \`IDX_pos_receipts_receipt_number\` (\`receiptNumber\`),
                INDEX \`IDX_pos_receipts_order\` (\`orderId\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `)

        await queryRunner.query("ALTER TABLE `orders` ADD `orderSource` varchar(32) NOT NULL DEFAULT 'admin'")
        await queryRunner.query("ALTER TABLE `orders` ADD `salesPointId` int NULL")
        await queryRunner.query("ALTER TABLE `orders` ADD `posShiftId` int NULL")
        await queryRunner.query("ALTER TABLE `orders` ADD `posDeviceId` int NULL")
        await queryRunner.query("CREATE INDEX `IDX_orders_order_source` ON `orders` (`orderSource`)")
        await queryRunner.query("CREATE INDEX `IDX_orders_sales_point` ON `orders` (`salesPointId`)")
        await queryRunner.query("CREATE INDEX `IDX_orders_pos_shift` ON `orders` (`posShiftId`)")
        await queryRunner.query("CREATE INDEX `IDX_orders_pos_device` ON `orders` (`posDeviceId`)")

        await queryRunner.query("ALTER TABLE `pos_devices` ADD CONSTRAINT `FK_pos_devices_sales_point` FOREIGN KEY (`salesPointId`) REFERENCES `sales_points`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION")
        await queryRunner.query("ALTER TABLE `pos_shifts` ADD CONSTRAINT `FK_pos_shifts_employee` FOREIGN KEY (`employeeId`) REFERENCES `admin_employees`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION")
        await queryRunner.query("ALTER TABLE `pos_shifts` ADD CONSTRAINT `FK_pos_shifts_sales_point` FOREIGN KEY (`salesPointId`) REFERENCES `sales_points`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION")
        await queryRunner.query("ALTER TABLE `pos_shifts` ADD CONSTRAINT `FK_pos_shifts_device` FOREIGN KEY (`deviceId`) REFERENCES `pos_devices`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION")
        await queryRunner.query("ALTER TABLE `pos_shift_events` ADD CONSTRAINT `FK_pos_shift_events_shift` FOREIGN KEY (`shiftId`) REFERENCES `pos_shifts`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION")
        await queryRunner.query("ALTER TABLE `pos_shift_events` ADD CONSTRAINT `FK_pos_shift_events_employee` FOREIGN KEY (`employeeId`) REFERENCES `admin_employees`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION")
        await queryRunner.query("ALTER TABLE `admin_employee_sales_points` ADD CONSTRAINT `FK_admin_employee_sales_points_employee` FOREIGN KEY (`employee_id`) REFERENCES `admin_employees`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION")
        await queryRunner.query("ALTER TABLE `admin_employee_sales_points` ADD CONSTRAINT `FK_admin_employee_sales_points_sales_point` FOREIGN KEY (`sales_point_id`) REFERENCES `sales_points`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION")
        await queryRunner.query("ALTER TABLE `product_barcodes` ADD CONSTRAINT `FK_product_barcodes_variant` FOREIGN KEY (`productVariantId`) REFERENCES `product_variants`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION")
        await queryRunner.query("ALTER TABLE `product_barcodes` ADD CONSTRAINT `FK_product_barcodes_size` FOREIGN KEY (`productVariantSizeId`) REFERENCES `product_variant_sizes`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION")
        await queryRunner.query("ALTER TABLE `pos_payments` ADD CONSTRAINT `FK_pos_payments_order` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION")
        await queryRunner.query("ALTER TABLE `pos_payments` ADD CONSTRAINT `FK_pos_payments_shift` FOREIGN KEY (`shiftId`) REFERENCES `pos_shifts`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION")
        await queryRunner.query("ALTER TABLE `pos_payments` ADD CONSTRAINT `FK_pos_payments_method` FOREIGN KEY (`methodId`) REFERENCES `payment_methods`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION")
        await queryRunner.query("ALTER TABLE `pos_receipts` ADD CONSTRAINT `FK_pos_receipts_order` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION")
        await queryRunner.query("ALTER TABLE `orders` ADD CONSTRAINT `FK_orders_sales_point` FOREIGN KEY (`salesPointId`) REFERENCES `sales_points`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION")
        await queryRunner.query("ALTER TABLE `orders` ADD CONSTRAINT `FK_orders_pos_shift` FOREIGN KEY (`posShiftId`) REFERENCES `pos_shifts`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION")
        await queryRunner.query("ALTER TABLE `orders` ADD CONSTRAINT `FK_orders_pos_device` FOREIGN KEY (`posDeviceId`) REFERENCES `pos_devices`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION")
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `orders` DROP FOREIGN KEY `FK_orders_pos_device`")
        await queryRunner.query("ALTER TABLE `orders` DROP FOREIGN KEY `FK_orders_pos_shift`")
        await queryRunner.query("ALTER TABLE `orders` DROP FOREIGN KEY `FK_orders_sales_point`")
        await queryRunner.query("ALTER TABLE `pos_receipts` DROP FOREIGN KEY `FK_pos_receipts_order`")
        await queryRunner.query("ALTER TABLE `pos_payments` DROP FOREIGN KEY `FK_pos_payments_method`")
        await queryRunner.query("ALTER TABLE `pos_payments` DROP FOREIGN KEY `FK_pos_payments_shift`")
        await queryRunner.query("ALTER TABLE `pos_payments` DROP FOREIGN KEY `FK_pos_payments_order`")
        await queryRunner.query("ALTER TABLE `product_barcodes` DROP FOREIGN KEY `FK_product_barcodes_size`")
        await queryRunner.query("ALTER TABLE `product_barcodes` DROP FOREIGN KEY `FK_product_barcodes_variant`")
        await queryRunner.query("ALTER TABLE `admin_employee_sales_points` DROP FOREIGN KEY `FK_admin_employee_sales_points_sales_point`")
        await queryRunner.query("ALTER TABLE `admin_employee_sales_points` DROP FOREIGN KEY `FK_admin_employee_sales_points_employee`")
        await queryRunner.query("ALTER TABLE `pos_shift_events` DROP FOREIGN KEY `FK_pos_shift_events_employee`")
        await queryRunner.query("ALTER TABLE `pos_shift_events` DROP FOREIGN KEY `FK_pos_shift_events_shift`")
        await queryRunner.query("ALTER TABLE `pos_shifts` DROP FOREIGN KEY `FK_pos_shifts_device`")
        await queryRunner.query("ALTER TABLE `pos_shifts` DROP FOREIGN KEY `FK_pos_shifts_sales_point`")
        await queryRunner.query("ALTER TABLE `pos_shifts` DROP FOREIGN KEY `FK_pos_shifts_employee`")
        await queryRunner.query("ALTER TABLE `pos_devices` DROP FOREIGN KEY `FK_pos_devices_sales_point`")

        await queryRunner.query("DROP INDEX `IDX_orders_pos_device` ON `orders`")
        await queryRunner.query("DROP INDEX `IDX_orders_pos_shift` ON `orders`")
        await queryRunner.query("DROP INDEX `IDX_orders_sales_point` ON `orders`")
        await queryRunner.query("DROP INDEX `IDX_orders_order_source` ON `orders`")
        await queryRunner.query("ALTER TABLE `orders` DROP COLUMN `posDeviceId`")
        await queryRunner.query("ALTER TABLE `orders` DROP COLUMN `posShiftId`")
        await queryRunner.query("ALTER TABLE `orders` DROP COLUMN `salesPointId`")
        await queryRunner.query("ALTER TABLE `orders` DROP COLUMN `orderSource`")

        await queryRunner.query("DROP TABLE `pos_receipts`")
        await queryRunner.query("DROP TABLE `pos_payments`")
        await queryRunner.query("DROP TABLE `product_barcodes`")
        await queryRunner.query("DROP TABLE `admin_employee_sales_points`")
        await queryRunner.query("DROP TABLE `pos_shift_events`")
        await queryRunner.query("DROP TABLE `pos_shifts`")
        await queryRunner.query("DROP TABLE `pos_devices`")
    }
}

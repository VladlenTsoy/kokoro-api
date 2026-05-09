import {MigrationInterface, QueryRunner} from "typeorm"

export class AddOrderStatusCodesAndUnsizedVariantStock1772100000000 implements MigrationInterface {
    name = "AddOrderStatusCodesAndUnsizedVariantStock1772100000000"

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `order_statuses` ADD `code` varchar(64) NULL")
        await queryRunner.query(
            "ALTER TABLE `order_statuses` ADD `deliveryStatus` enum ('pending', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled') NULL"
        )

        await queryRunner.query("ALTER TABLE `product_variants` ADD `qty` int NULL")
        await queryRunner.query("ALTER TABLE `product_variants` ADD `reservedQty` int NOT NULL DEFAULT 0")
        await queryRunner.query("ALTER TABLE `product_variants` ADD `soldQty` int NOT NULL DEFAULT 0")

        await queryRunner.query(`
            UPDATE \`order_statuses\`
            SET \`code\` = LOWER(REPLACE(TRIM(\`title\`), ' ', '_'))
            WHERE \`code\` IS NULL
        `)
        await queryRunner.query(`
            UPDATE \`order_statuses\`
            SET \`deliveryStatus\` = CASE
                WHEN LOWER(CONCAT(COALESCE(\`code\`, ''), ' ', \`title\`)) REGEXP 'cancel|отмен' THEN 'cancelled'
                WHEN LOWER(CONCAT(COALESCE(\`code\`, ''), ' ', \`title\`)) REGEXP 'complete|done|closed|заверш|выдан' THEN 'delivered'
                WHEN LOWER(CONCAT(COALESCE(\`code\`, ''), ' ', \`title\`)) REGEXP 'deliver|courier|достав' THEN 'delivering'
                WHEN LOWER(CONCAT(COALESCE(\`code\`, ''), ' ', \`title\`)) REGEXP 'ready|готов' THEN 'ready'
                WHEN LOWER(CONCAT(COALESCE(\`code\`, ''), ' ', \`title\`)) REGEXP 'confirm|accept|prepar|подтверж|принят|готовит' THEN 'preparing'
                ELSE 'pending'
            END
            WHERE \`deliveryStatus\` IS NULL
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `product_variants` DROP COLUMN `soldQty`")
        await queryRunner.query("ALTER TABLE `product_variants` DROP COLUMN `reservedQty`")
        await queryRunner.query("ALTER TABLE `product_variants` DROP COLUMN `qty`")

        await queryRunner.query("ALTER TABLE `order_statuses` DROP COLUMN `deliveryStatus`")
        await queryRunner.query("ALTER TABLE `order_statuses` DROP COLUMN `code`")
    }
}

import {MigrationInterface, QueryRunner} from "typeorm"

export class AddPaymeTransactions1771500000000 implements MigrationInterface {
    name = "AddPaymeTransactions1771500000000"

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            "CREATE TABLE `payme_transactions` (`id` int NOT NULL AUTO_INCREMENT, `paymeId` varchar(64) NOT NULL, `amount` int NOT NULL, `state` int NOT NULL, `createTime` bigint NOT NULL, `performTime` bigint NOT NULL DEFAULT 0, `cancelTime` bigint NOT NULL DEFAULT 0, `reason` int NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `orderId` int NOT NULL, UNIQUE INDEX `IDX_payme_transactions_payme_id` (`paymeId`), INDEX `IDX_payme_transactions_order` (`orderId`), PRIMARY KEY (`id`)) ENGINE=InnoDB"
        )
        await queryRunner.query(
            "ALTER TABLE `payme_transactions` ADD CONSTRAINT `FK_payme_transactions_order` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION"
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `payme_transactions` DROP FOREIGN KEY `FK_payme_transactions_order`")
        await queryRunner.query("DROP INDEX `IDX_payme_transactions_order` ON `payme_transactions`")
        await queryRunner.query("DROP INDEX `IDX_payme_transactions_payme_id` ON `payme_transactions`")
        await queryRunner.query("DROP TABLE `payme_transactions`")
    }
}

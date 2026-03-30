import {MigrationInterface, QueryRunner} from "typeorm"

export class AddCollectionsAndVariantDescription1769900000000 implements MigrationInterface {
    name = "AddCollectionsAndVariantDescription1769900000000"

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `product_variants` ADD `description` text NULL")

        await queryRunner.query(
            "CREATE TABLE `collections` (`id` int NOT NULL AUTO_INCREMENT, `title` varchar(150) NOT NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX `IDX_collections_title` (`title`), PRIMARY KEY (`id`)) ENGINE=InnoDB"
        )

        await queryRunner.query(
            "CREATE TABLE `collection_product_variants` (`product_variant_id` int NOT NULL, `collection_id` int NOT NULL, INDEX `IDX_collection_product_variant` (`product_variant_id`), INDEX `IDX_collection_product_collection` (`collection_id`), PRIMARY KEY (`product_variant_id`, `collection_id`)) ENGINE=InnoDB"
        )

        await queryRunner.query(
            "ALTER TABLE `collection_product_variants` ADD CONSTRAINT `FK_collection_product_variant` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION"
        )
        await queryRunner.query(
            "ALTER TABLE `collection_product_variants` ADD CONSTRAINT `FK_collection_product_collection` FOREIGN KEY (`collection_id`) REFERENCES `collections`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION"
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            "ALTER TABLE `collection_product_variants` DROP FOREIGN KEY `FK_collection_product_collection`"
        )
        await queryRunner.query("ALTER TABLE `collection_product_variants` DROP FOREIGN KEY `FK_collection_product_variant`")
        await queryRunner.query("DROP INDEX `IDX_collection_product_collection` ON `collection_product_variants`")
        await queryRunner.query("DROP INDEX `IDX_collection_product_variant` ON `collection_product_variants`")
        await queryRunner.query("DROP TABLE `collection_product_variants`")

        await queryRunner.query("DROP INDEX `IDX_collections_title` ON `collections`")
        await queryRunner.query("DROP TABLE `collections`")

        await queryRunner.query("ALTER TABLE `product_variants` DROP COLUMN `description`")
    }
}

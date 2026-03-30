import {MigrationInterface, QueryRunner} from "typeorm"

export class AddAdminAuthAndRbac1769800000000 implements MigrationInterface {
    name = "AddAdminAuthAndRbac1769800000000"

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            "CREATE TABLE `admin_roles` (`id` int NOT NULL AUTO_INCREMENT, `code` varchar(50) NOT NULL, `name` varchar(100) NOT NULL, `isActive` tinyint NOT NULL DEFAULT 1, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX `IDX_admin_roles_code` (`code`), PRIMARY KEY (`id`)) ENGINE=InnoDB"
        )

        await queryRunner.query(
            "CREATE TABLE `admin_employees` (`id` int NOT NULL AUTO_INCREMENT, `email` varchar(150) NOT NULL, `firstName` varchar(100) NOT NULL, `lastName` varchar(100) NOT NULL, `phone` varchar(30) NULL, `passwordHash` varchar(255) NOT NULL, `passwordSalt` varchar(255) NOT NULL, `isActive` tinyint NOT NULL DEFAULT 1, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX `IDX_admin_employees_email` (`email`), PRIMARY KEY (`id`)) ENGINE=InnoDB"
        )

        await queryRunner.query(
            "CREATE TABLE `admin_employee_roles` (`employee_id` int NOT NULL, `role_id` int NOT NULL, INDEX `IDX_admin_employee_roles_employee` (`employee_id`), INDEX `IDX_admin_employee_roles_role` (`role_id`), PRIMARY KEY (`employee_id`, `role_id`)) ENGINE=InnoDB"
        )

        await queryRunner.query(
            "ALTER TABLE `admin_employee_roles` ADD CONSTRAINT `FK_admin_employee_roles_employee` FOREIGN KEY (`employee_id`) REFERENCES `admin_employees`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION"
        )
        await queryRunner.query(
            "ALTER TABLE `admin_employee_roles` ADD CONSTRAINT `FK_admin_employee_roles_role` FOREIGN KEY (`role_id`) REFERENCES `admin_roles`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION"
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `admin_employee_roles` DROP FOREIGN KEY `FK_admin_employee_roles_role`")
        await queryRunner.query("ALTER TABLE `admin_employee_roles` DROP FOREIGN KEY `FK_admin_employee_roles_employee`")
        await queryRunner.query("DROP INDEX `IDX_admin_employee_roles_role` ON `admin_employee_roles`")
        await queryRunner.query("DROP INDEX `IDX_admin_employee_roles_employee` ON `admin_employee_roles`")
        await queryRunner.query("DROP TABLE `admin_employee_roles`")
        await queryRunner.query("DROP INDEX `IDX_admin_employees_email` ON `admin_employees`")
        await queryRunner.query("DROP TABLE `admin_employees`")
        await queryRunner.query("DROP INDEX `IDX_admin_roles_code` ON `admin_roles`")
        await queryRunner.query("DROP TABLE `admin_roles`")
    }
}

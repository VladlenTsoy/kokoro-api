import {MigrationInterface, QueryRunner} from "typeorm"

const ALL_ADMIN_PERMISSION_CODES = [
    "dashboard.read",
    "dashboard.create",
    "dashboard.update",
    "dashboard.delete",
    "dashboard.manage",
    "orders.read",
    "orders.create",
    "orders.update",
    "orders.delete",
    "orders.manage",
    "clients.read",
    "clients.create",
    "clients.update",
    "clients.delete",
    "clients.manage",
    "catalog.read",
    "catalog.create",
    "catalog.update",
    "catalog.delete",
    "catalog.manage",
    "marketing.read",
    "marketing.create",
    "marketing.update",
    "marketing.delete",
    "marketing.manage",
    "settings.read",
    "settings.create",
    "settings.update",
    "settings.delete",
    "settings.manage",
    "staff.read",
    "staff.create",
    "staff.update",
    "staff.delete",
    "staff.manage",
    "files.read",
    "files.create",
    "files.update",
    "files.delete",
    "files.manage"
]

export class AddAdminRolePermissions1771700000000 implements MigrationInterface {
    name = "AddAdminRolePermissions1771700000000"

    public async up(queryRunner: QueryRunner): Promise<void> {
        const hasPermissionsColumn = await queryRunner.hasColumn("admin_roles", "permissions")
        if (!hasPermissionsColumn) {
            await queryRunner.query("ALTER TABLE `admin_roles` ADD `permissions` json NULL")
        }

        await queryRunner.query("UPDATE `admin_roles` SET `permissions` = ? WHERE `code` = 'SUPER_ADMIN'", [
            JSON.stringify(ALL_ADMIN_PERMISSION_CODES)
        ])
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const hasPermissionsColumn = await queryRunner.hasColumn("admin_roles", "permissions")
        if (hasPermissionsColumn) {
            await queryRunner.query("ALTER TABLE `admin_roles` DROP COLUMN `permissions`")
        }
    }
}

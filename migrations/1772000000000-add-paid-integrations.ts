import {MigrationInterface, QueryRunner} from "typeorm"

export class AddPaidIntegrations1772000000000 implements MigrationInterface {
    name = "AddPaidIntegrations1772000000000"

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE integration_settings (
                id int NOT NULL AUTO_INCREMENT,
                providerKey varchar(64) NOT NULL,
                title varchar(120) NOT NULL,
                description varchar(255) NULL,
                isPaid tinyint NOT NULL DEFAULT 1,
                billingStatus enum('free', 'active', 'locked', 'expired') NOT NULL DEFAULT 'locked',
                runtimeStatus enum('disabled', 'enabled', 'paused', 'error') NOT NULL DEFAULT 'disabled',
                enabled tinyint NOT NULL DEFAULT 0,
                configured tinyint NOT NULL DEFAULT 0,
                healthy tinyint NOT NULL DEFAULT 0,
                enabledScopes json NULL,
                publicConfig json NULL,
                secretConfigEncrypted text NULL,
                lastError varchar(255) NULL,
                lastHealthCheckAt datetime NULL,
                enabledAt datetime NULL,
                billingActiveUntil datetime NULL,
                createdAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                updatedAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX IDX_integration_settings_providerKey (providerKey),
                PRIMARY KEY (id)
            ) ENGINE=InnoDB
        `)

        await queryRunner.query(`
            CREATE TABLE integration_outbox_events (
                id int NOT NULL AUTO_INCREMENT,
                providerKey varchar(64) NOT NULL,
                eventName varchar(80) NOT NULL,
                eventId varchar(120) NOT NULL,
                idempotencyKey varchar(160) NOT NULL,
                payload json NOT NULL,
                status enum('pending', 'sent', 'skipped', 'failed', 'dead') NOT NULL DEFAULT 'pending',
                attempts int NOT NULL DEFAULT 0,
                lastError text NULL,
                nextAttemptAt datetime NULL,
                sentAt datetime NULL,
                createdAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                updatedAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                INDEX IDX_integration_outbox_events_providerKey (providerKey),
                INDEX IDX_integration_outbox_events_eventName (eventName),
                PRIMARY KEY (id)
            ) ENGINE=InnoDB
        `)

        await queryRunner.query(`
            INSERT INTO integration_settings
                (providerKey, title, description, isPaid, billingStatus, runtimeStatus, enabled, configured, healthy, enabledScopes)
            VALUES
                ('datra_cdp', 'Datra CDP', 'Платная интеграция с Datra для CDP, заказов, клиентов и событий.', 1, 'locked', 'disabled', 0, 0, 0, JSON_ARRAY('customers', 'products', 'categories', 'branches', 'orders', 'order_statuses', 'events'))
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE integration_outbox_events`)
        await queryRunner.query(`DROP TABLE integration_settings`)
    }
}

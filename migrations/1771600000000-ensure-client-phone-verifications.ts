import {MigrationInterface, QueryRunner} from "typeorm"

export class EnsureClientPhoneVerifications1771600000000 implements MigrationInterface {
    name = "EnsureClientPhoneVerifications1771600000000"

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            "CREATE TABLE IF NOT EXISTS `client_phone_verifications` (`id` int NOT NULL AUTO_INCREMENT, `requestId` varchar(128) NOT NULL, `phone` varchar(50) NOT NULL, `status` varchar(32) NOT NULL, `attempts` int NOT NULL DEFAULT 0, `expiresAt` datetime NOT NULL, `consumedAt` datetime NULL, `gatewayResponse` json NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX `IDX_client_phone_verifications_request` (`requestId`), INDEX `IDX_client_phone_verifications_phone` (`phone`), PRIMARY KEY (`id`)) ENGINE=InnoDB"
        )
    }

    public async down(): Promise<void> {
        // No-op: this is a production repair migration for environments where the original auth migration was already recorded.
    }
}

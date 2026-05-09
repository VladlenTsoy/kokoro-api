import {Module} from "@nestjs/common"
import {TypeOrmModule} from "@nestjs/typeorm"
import {IntegrationController} from "./integration.controller"
import {IntegrationService} from "./integration.service"
import {IntegrationSecretService} from "./integration-secret.service"
import {IntegrationSettingEntity} from "./entities/integration-setting.entity"
import {IntegrationOutboxEventEntity} from "./entities/integration-outbox-event.entity"

@Module({
    imports: [TypeOrmModule.forFeature([IntegrationSettingEntity, IntegrationOutboxEventEntity])],
    controllers: [IntegrationController],
    providers: [IntegrationService, IntegrationSecretService],
    exports: [IntegrationService]
})
export class IntegrationModule {}

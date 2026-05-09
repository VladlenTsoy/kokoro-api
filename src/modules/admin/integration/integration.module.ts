import {Module} from "@nestjs/common"
import {TypeOrmModule} from "@nestjs/typeorm"
import {IntegrationController} from "./integration.controller"
import {IntegrationService} from "./integration.service"
import {IntegrationSecretService} from "./integration-secret.service"
import {IntegrationOutboxWorker} from "./integration-outbox.worker"
import {DatraCdpAdapter} from "./datra-cdp.adapter"
import {IntegrationSettingEntity} from "./entities/integration-setting.entity"
import {IntegrationOutboxEventEntity} from "./entities/integration-outbox-event.entity"

@Module({
    imports: [TypeOrmModule.forFeature([IntegrationSettingEntity, IntegrationOutboxEventEntity])],
    controllers: [IntegrationController],
    providers: [IntegrationService, IntegrationSecretService, IntegrationOutboxWorker, DatraCdpAdapter],
    exports: [IntegrationService]
})
export class IntegrationModule {}

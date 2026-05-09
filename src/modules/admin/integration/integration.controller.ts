import {Body, Controller, Get, Param, Patch, Post, UsePipes, ValidationPipe} from "@nestjs/common"
import {ApiOperation, ApiTags} from "@nestjs/swagger"
import {IntegrationService} from "./integration.service"
import {IntegrationProviderKey} from "./entities/integration-setting.entity"
import {UpdateIntegrationDto} from "./dto/update-integration.dto"

@ApiTags("Admin Integrations")
@Controller("admin/integrations")
export class IntegrationController {
    constructor(private readonly integrationService: IntegrationService) {}

    @Get()
    @ApiOperation({summary: "List managed integrations"})
    list() {
        return this.integrationService.list()
    }

    @Get(":providerKey")
    @ApiOperation({summary: "Get integration settings"})
    findOne(@Param("providerKey") providerKey: IntegrationProviderKey) {
        return this.integrationService.findOne(providerKey)
    }

    @Patch(":providerKey")
    @ApiOperation({summary: "Update integration settings"})
    @UsePipes(new ValidationPipe({transform: true, whitelist: true}))
    update(@Param("providerKey") providerKey: IntegrationProviderKey, @Body() dto: UpdateIntegrationDto) {
        return this.integrationService.update(providerKey, dto)
    }

    @Post(":providerKey/test")
    @ApiOperation({summary: "Validate integration configuration"})
    test(@Param("providerKey") providerKey: IntegrationProviderKey) {
        return this.integrationService.test(providerKey)
    }
}

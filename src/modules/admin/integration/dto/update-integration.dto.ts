import {IsArray, IsBoolean, IsIn, IsISO8601, IsObject, IsOptional, IsString} from "class-validator"
import {
    IntegrationBillingStatus,
    IntegrationEventScope,
    IntegrationRuntimeStatus
} from "../entities/integration-setting.entity"

const SCOPES: IntegrationEventScope[] = [
    "customers",
    "devices",
    "products",
    "categories",
    "branches",
    "orders",
    "order_statuses",
    "events",
    "promotions",
    "loyalty"
]

export class UpdateIntegrationDto {
    @IsOptional()
    @IsBoolean()
    enabled?: boolean

    @IsOptional()
    @IsIn(Object.values(IntegrationRuntimeStatus))
    runtimeStatus?: IntegrationRuntimeStatus

    @IsOptional()
    @IsIn(Object.values(IntegrationBillingStatus))
    billingStatus?: IntegrationBillingStatus

    @IsOptional()
    @IsISO8601()
    billingActiveUntil?: string | null

    @IsOptional()
    @IsArray()
    @IsIn(SCOPES, {each: true})
    enabledScopes?: IntegrationEventScope[]

    @IsOptional()
    @IsObject()
    publicConfig?: Record<string, unknown>

    @IsOptional()
    @IsString()
    apiToken?: string
}

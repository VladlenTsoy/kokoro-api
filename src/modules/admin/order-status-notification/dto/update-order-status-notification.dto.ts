import {PartialType} from "@nestjs/swagger"
import {CreateOrderStatusNotificationDto} from "./create-order-status-notification.dto"

export class UpdateOrderStatusNotificationDto extends PartialType(CreateOrderStatusNotificationDto) {}

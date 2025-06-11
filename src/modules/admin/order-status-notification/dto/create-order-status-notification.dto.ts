import {IsEnum, IsString, IsBoolean, IsNumber} from "class-validator"
import {ApiProperty} from "@nestjs/swagger"
import {NotificationType, NotificationTarget} from "../entities/order-status-notification.entity"

export class CreateOrderStatusNotificationDto {
    @ApiProperty({example: 1, description: "ID статуса"})
    @IsNumber()
    statusId: number

    @ApiProperty({enum: NotificationType})
    @IsEnum(NotificationType)
    type: NotificationType

    @ApiProperty({enum: NotificationTarget})
    @IsEnum(NotificationTarget)
    sendTo: NotificationTarget

    @ApiProperty({example: "template_key"})
    @IsString()
    template: string

    @ApiProperty({example: true})
    @IsBoolean()
    isActive: boolean
}

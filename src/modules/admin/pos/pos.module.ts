import {Module} from "@nestjs/common"
import {TypeOrmModule} from "@nestjs/typeorm"
import {EmployeeEntity} from "../employee/entities/employee.entity"
import {OrderEntity} from "../order/entities/order.entity"
import {SalesPointEntity} from "../sales-point/entities/sales-point.entity"
import {ProductVariantEntity} from "../product-variant/entities/product-variant.entity"
import {ProductBarcodeEntity} from "../product-barcode/entities/product-barcode.entity"
import {PosDeviceEntity} from "./entities/pos-device.entity"
import {PosPaymentEntity} from "./entities/pos-payment.entity"
import {PosReceiptEntity} from "./entities/pos-receipt.entity"
import {PosShiftEventEntity} from "./entities/pos-shift-event.entity"
import {PosShiftEntity} from "./entities/pos-shift.entity"
import {PosController} from "./pos.controller"
import {PosService} from "./pos.service"

@Module({
    imports: [
        TypeOrmModule.forFeature([
            PosShiftEntity,
            PosDeviceEntity,
            PosShiftEventEntity,
            PosPaymentEntity,
            PosReceiptEntity,
            EmployeeEntity,
            SalesPointEntity,
            OrderEntity,
            ProductVariantEntity,
            ProductBarcodeEntity
        ])
    ],
    controllers: [PosController],
    providers: [PosService],
    exports: [PosService]
})
export class PosModule {}

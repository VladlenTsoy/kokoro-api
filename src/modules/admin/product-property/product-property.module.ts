import {Module} from "@nestjs/common"
import {ProductPropertyService} from "./product-property.service"
import {ProductPropertyController} from "./product-property.controller"
import {TypeOrmModule} from "@nestjs/typeorm"
import {ProductPropertyEntity} from "./entities/product-property.entity"

@Module({
    imports: [TypeOrmModule.forFeature([ProductPropertyEntity])],
    controllers: [ProductPropertyController],
    providers: [ProductPropertyService]
})
export class ProductPropertyModule {}

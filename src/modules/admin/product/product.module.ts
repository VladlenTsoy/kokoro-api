import {Module} from "@nestjs/common"
import {TypeOrmModule} from "@nestjs/typeorm"
import {ProductEntity} from "./entities/product.entity"
import {ProductService} from "./product.service"
import {ProductPropertyModule} from "../product-property/product-property.module"

@Module({
    imports: [TypeOrmModule.forFeature([ProductEntity]), ProductPropertyModule],
    providers: [ProductService],
    exports: [ProductService]
})
export class ProductModule {}

import {Module} from "@nestjs/common"
import {AppController} from "./app.controller"
import {AppService} from "./app.service"
import {ProductModule} from "./modules/product/product.module"
import {ProductColorModule} from "./modules/product-color/product-color.module"
import {ProductColorTagModule} from "./modules/product-color-tag/product-color-tag.module"
import {SizeModule} from "./modules/size/size.module"
import {ColorModule} from "./modules/color/color.module"
import {ProductCategoryModule} from "./modules/product-category/product-category.module"
import {TypeOrmModule} from "@nestjs/typeorm"
import {ProductCategoryEntity} from "./modules/product-category/entities/product-category.entity"
import {ConfigModule} from "@nestjs/config"
import {configDataSource} from "../ormconfig"

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }),
        TypeOrmModule.forRoot(configDataSource),
        TypeOrmModule.forFeature([ProductCategoryEntity]),
        ProductModule,
        ProductColorModule,
        ColorModule,
        ProductColorTagModule,
        SizeModule,
        ProductCategoryModule
    ],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule {}

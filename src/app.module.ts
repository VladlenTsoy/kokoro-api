import {Module} from "@nestjs/common"
import {AppController} from "./app.controller"
import {AppService} from "./app.service"
import {ProductModule} from "./modules/product/product.module"
import {ProductColorModule} from "./modules/product-color/product-color.module"
import {ProductColorTagModule} from "./modules/product-color-tag/product-color-tag.module"
import {SizeModule} from "./modules/size/size.module"
import {ColorModule} from "./modules/color/color.module"
import {ProductCategoryModule} from "./modules/product-category/product-category.module"
import {ConfigTypeORM} from "./config/type-orm.config"
import {TypeOrmModule} from "@nestjs/typeorm"
import {ProductCategoryEntity} from "./modules/product-category/entities/product-category.entity"
import {ConfigModule, ConfigService} from "@nestjs/config"

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: "mysql",
                host: configService.get<string>("DB_HOST"),
                port: Number(configService.get<string>("DB_PORT")),
                username: configService.get<string>("DB_USERNAME"),
                password: configService.get<string>("DB_PASSWORD"),
                database: configService.get<string>("DB_DATABASE"),
                entities: [ProductCategoryEntity],
                synchronize: configService.get<string>("APP_MODE") === "development",
                migrationsTableName: "migrations",
                migrations: ["./src/migrations/*.ts"]
            })
        }),
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
export class AppModule {
}

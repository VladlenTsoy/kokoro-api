import {ConfigModule, ConfigService} from "@nestjs/config"
import {TypeOrmModuleAsyncOptions} from "@nestjs/typeorm/dist/interfaces/typeorm-options.interface"
import {ProductCategoryEntity} from "../modules/product-category/entities/product-category.entity"

export const ConfigFunctionTypeORM = {
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
} as TypeOrmModuleAsyncOptions

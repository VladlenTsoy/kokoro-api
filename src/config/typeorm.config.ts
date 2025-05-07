import {ConfigModule, ConfigService} from "@nestjs/config"
import {TypeOrmModuleAsyncOptions} from "@nestjs/typeorm/dist/interfaces/typeorm-options.interface"

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => ({
        type: "mysql",
        host: configService.get<string>("DB_HOST", "localhost"),
        port: configService.get<number>("DB_PORT", 3306),
        username: configService.get<string>("DB_USERNAME", "root"),
        password: configService.get<string>("DB_PASSWORD", "root"),
        database: configService.get<string>("DB_DATABASE", "crm"),
        entities: [__dirname + "/../**/*.entity{.ts,.js}"],
        migrations: [__dirname + "/../migrations/*{.ts,.js}"],
        synchronize: false,
        logging: configService.get<string>("APP_MODE") === "development",
        migrationsTableName: "migrations",
        migrationsRun: configService.get<string>("APP_MODE") !== "development",
        extra: {
            charset: "utf8mb4_unicode_ci"
        },
        autoLoadEntities: true
    })
}

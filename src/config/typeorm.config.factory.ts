import {ConfigService} from "@nestjs/config"
import {TypeOrmModuleOptions} from "@nestjs/typeorm"
import {DataSourceOptions} from "typeorm"

export function createTypeOrmConfig(configService: ConfigService): TypeOrmModuleOptions & DataSourceOptions {
    const isDev = configService.get<string>("APP_MODE") === "development"

    return {
        type: "mysql",
        host: configService.get<string>("DB_HOST", "localhost"),
        port: configService.get<number>("DB_PORT", 3306),
        username: configService.get<string>("DB_USERNAME", "root"),
        password: configService.get<string>("DB_PASSWORD", "root"),
        database: configService.get<string>("DB_DATABASE", "crm"),
        entities: [__dirname + "/../../**/*.entity{.ts,.js}"],
        migrations: [__dirname + "/../../migrations/*{.ts,.js}"],
        synchronize: false,
        logging: isDev,
        migrationsTableName: "migrations",
        migrationsRun: !isDev,
        charset: "utf8mb4_unicode_ci",
        autoLoadEntities: true
    }
}
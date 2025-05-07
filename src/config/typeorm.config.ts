import {ConfigModule, ConfigService} from "@nestjs/config"
import {TypeOrmModuleAsyncOptions} from "@nestjs/typeorm"
import {createTypeOrmConfig} from "./typeorm.config.factory"

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => createTypeOrmConfig(configService)
}
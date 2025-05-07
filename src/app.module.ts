import {Module} from "@nestjs/common"
import {AppController} from "./app.controller"
import {AppService} from "./app.service"
import {TypeOrmModule} from "@nestjs/typeorm"
import {ConfigModule} from "@nestjs/config"
import {AdminModule} from "./modules/admin/admin.module"
import {typeOrmAsyncConfig} from "./config/typeorm.config"

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }),
        TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
        AdminModule
    ],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule {}

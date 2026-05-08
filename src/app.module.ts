import {Module} from "@nestjs/common"
import {AppController} from "./app.controller"
import {AppService} from "./app.service"
import {TypeOrmModule} from "@nestjs/typeorm"
import {ConfigModule} from "@nestjs/config"
import {AdminModule} from "./modules/admin/admin.module"
import {ClientModule} from "./modules/client/client.module"
import {typeOrmAsyncConfig} from "./config/typeorm.config"
import {PaymeModule} from "./modules/payme/payme.module"
import {SearchZeroResultModule} from "./modules/search-zero-result/search-zero-result.module"

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }),
        TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
        PaymeModule,
        SearchZeroResultModule,
        AdminModule,
        ClientModule
    ],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule {}

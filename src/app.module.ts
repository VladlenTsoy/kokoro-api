import {Module} from "@nestjs/common"
import {AppController} from "./app.controller"
import {AppService} from "./app.service"
import {TypeOrmModule} from "@nestjs/typeorm"
import {ConfigModule} from "@nestjs/config"
import {configDataSource} from "../ormconfig"
import {AdminModule} from "./modules/admin/admin.module"

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }),
        TypeOrmModule.forRoot(configDataSource),
        AdminModule
    ],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule {}

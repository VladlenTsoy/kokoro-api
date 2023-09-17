import {Module} from "@nestjs/common"
import {AppController} from "./app.controller"
import {AppService} from "./app.service"
import {MikroOrmModule} from "@mikro-orm/nestjs"
import mikroOrmConfig from "./config/mikro-orm.config"
import {ConfigModule} from "@nestjs/config"
import {CategoryEntity} from "./entities/category.entity"
import {ProductModule} from "./modules/product/product.module"

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [mikroOrmConfig]
        }),
        MikroOrmModule.forRoot(mikroOrmConfig()),
        MikroOrmModule.forFeature([CategoryEntity]),
        ProductModule
    ],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule {
}

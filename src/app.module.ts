import {Module} from "@nestjs/common"
import {AppController} from "./app.controller"
import {AppService} from "./app.service"
import {MikroOrmModule} from "@mikro-orm/nestjs"

@Module({
    imports: [
        MikroOrmModule.forRoot({
            // entities: ["./dist/entities"],
            // entitiesTs: ["./src/entities"],
            // dbName: "my-db-name.sqlite3",
            // defineConfig: "mysql"
        })
    ],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule {
}
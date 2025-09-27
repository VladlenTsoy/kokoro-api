import {NestFactory} from "@nestjs/core"
import {AppModule} from "./app.module"
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger"
import * as bodyParser from "body-parser"

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {abortOnError: false})
    app.setGlobalPrefix("api")
    app.use(bodyParser.json({limit: "10mb"}))
    app.use(bodyParser.urlencoded({limit: "10mb", extended: true}))

    const config = new DocumentBuilder()
        .setTitle("Kokoro API")
        .setDescription(
            "This documentation provides a detailed overview of our CRM system's API, offering essential information on authentication methods, available endpoints, and their usage. Here, you will find comprehensive examples of requests and responses, designed to facilitate the seamless integration of your application with our system."
        )
        .setVersion("1.0")
        .build()

    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup("api", app, document)

    app.enableCors({
        origin: true
        // origin: ["*"], // Разрешённые источники
        // methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        // credentials: true
    })

    await app.listen(3000)
}

bootstrap()

import {DataSource} from "typeorm"
import * as dotenv from "dotenv"
import {ConfigService} from "@nestjs/config"
import {createTypeOrmConfig} from "./src/config/typeorm.config.factory"

dotenv.config()

const configService = new ConfigService()

const dataSource = new DataSource(createTypeOrmConfig(configService))
export default dataSource

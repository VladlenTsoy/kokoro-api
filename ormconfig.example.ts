import {DataSource} from "typeorm"
import {DataSourceOptions} from "typeorm/data-source/DataSourceOptions"

export const configDataSource = {
    type: "mysql",
    host: "localhost",
    port: 3066,
    username: "root",
    password: "root",
    database: "crm",
    synchronize: false,
    logging: true,
    entities: ["dist/src/**/*.entity.js"],
    migrations: ["dist/migrations/*.js"]
} as DataSourceOptions

const AppDataSource = new DataSource(configDataSource)
export default AppDataSource

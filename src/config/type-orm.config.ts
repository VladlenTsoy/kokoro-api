import {ProductCategoryEntity} from "../modules/product-category/entities/product-category.entity"
import {DataSourceOptions} from "typeorm"

if (!process.env.DB_HOST) throw new Error("unknown environment")

export const ConfigTypeORM: DataSourceOptions = {
    type: "mysql",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [ProductCategoryEntity],
    synchronize: process.env.APP_MODE === "development",
    migrationsTableName: "migrations",
    migrations: ["./src/migrations/*.ts"]
}


// const logger = new Logger("MikroORM")
// export default (): Options =>
//     defineConfig({
//         // entities: ["./dist/entities"],
//         entities: [ProductCategoryEntity, ColorEntity],
//         entitiesTs: ["./src/entities"],
//         dbName: process.env.DB_NAME,
//         port: 3306,
//         debug: true,
//         user: process.env.DB_USERNAME,
//         password: process.env.DB_PASSWORD,
//         logger: logger.log.bind(logger),
//         migrations: {
//             tableName: "mikro_orm_migrations", // name of database table with log of executed transactions
//             path: "./dist/migrations",
//             pathTs: "./src/migrations",
//             glob: "!(*.d).{js,ts}", // how to match migration files (all .js and .ts files, but not .d.ts)
//             transactional: true, // wrap each migration in a transaction
//             disableForeignKeys: true, // wrap statements with `set foreign_key_checks = 0` or equivalent
//             allOrNothing: true, // wrap all migrations in master transaction
//             dropTables: true, // allow to disable table dropping
//             safe: false, // allow to disable table and column dropping
//             snapshot: false, // save snapshot when creating new migrations
//             emit: "ts", // migration generation mode
//             generator: TSMigrationGenerator // migration generator, e.g. to allow custom formatting
//         }
//     })

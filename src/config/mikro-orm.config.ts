import {Logger} from "@nestjs/common"
import {Options} from "@mikro-orm/core"
import {defineConfig} from "@mikro-orm/mysql"
import {TSMigrationGenerator} from "@mikro-orm/migrations"
import {CategoryEntity} from "../entities/category.entity"

const logger = new Logger("MikroORM")
export default (): Options => defineConfig({
    // entities: ["./dist/entities"],
    entities: [CategoryEntity],
    entitiesTs: ["./src/entities"],
    dbName: process.env.DB_NAME,
    port: 3306,
    debug: true,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    logger: logger.log.bind(logger),
    migrations: {
        tableName: "mikro_orm_migrations", // name of database table with log of executed transactions
        path: "./dist/migrations",
        pathTs: "./src/migrations",
        glob: "!(*.d).{js,ts}", // how to match migration files (all .js and .ts files, but not .d.ts)
        transactional: true, // wrap each migration in a transaction
        disableForeignKeys: true, // wrap statements with `set foreign_key_checks = 0` or equivalent
        allOrNothing: true, // wrap all migrations in master transaction
        dropTables: true, // allow to disable table dropping
        safe: false, // allow to disable table and column dropping
        snapshot: false, // save snapshot when creating new migrations
        emit: "ts", // migration generation mode
        generator: TSMigrationGenerator // migration generator, e.g. to allow custom formatting
    }
})

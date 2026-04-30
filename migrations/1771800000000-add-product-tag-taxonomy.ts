import {MigrationInterface, QueryRunner} from "typeorm"

const CYRILLIC_TRANSLIT: Record<string, string> = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ё: "e",
    ж: "zh",
    з: "z",
    и: "i",
    й: "y",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "h",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "sch",
    ъ: "",
    ы: "y",
    ь: "",
    э: "e",
    ю: "yu",
    я: "ya"
}

function slugify(value: string) {
    const transliterated = value
        .toLowerCase()
        .split("")
        .map((char) => CYRILLIC_TRANSLIT[char] ?? char)
        .join("")

    const slug = transliterated
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 120)

    return slug || "tag"
}

export class AddProductTagTaxonomy1771800000000 implements MigrationInterface {
    name = "AddProductTagTaxonomy1771800000000"

    public async up(queryRunner: QueryRunner): Promise<void> {
        const hasProductTags = await queryRunner.hasTable("product_tags")
        if (!hasProductTags) return

        await queryRunner.query("ALTER TABLE `product_tags` MODIFY `title` varchar(100) NOT NULL")

        if (!(await queryRunner.hasColumn("product_tags", "slug"))) {
            await queryRunner.query("ALTER TABLE `product_tags` ADD `slug` varchar(120) NULL")
        }
        if (!(await queryRunner.hasColumn("product_tags", "type"))) {
            await queryRunner.query("ALTER TABLE `product_tags` ADD `type` varchar(32) NOT NULL DEFAULT 'custom'")
        }
        if (!(await queryRunner.hasColumn("product_tags", "colorHex"))) {
            await queryRunner.query("ALTER TABLE `product_tags` ADD `colorHex` varchar(20) NULL")
        }
        if (!(await queryRunner.hasColumn("product_tags", "isActive"))) {
            await queryRunner.query("ALTER TABLE `product_tags` ADD `isActive` tinyint NOT NULL DEFAULT 1")
        }
        if (!(await queryRunner.hasColumn("product_tags", "sortOrder"))) {
            await queryRunner.query("ALTER TABLE `product_tags` ADD `sortOrder` int NOT NULL DEFAULT 100")
        }
        if (!(await queryRunner.hasColumn("product_tags", "createdAt"))) {
            await queryRunner.query("ALTER TABLE `product_tags` ADD `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)")
        }
        if (!(await queryRunner.hasColumn("product_tags", "updatedAt"))) {
            await queryRunner.query(
                "ALTER TABLE `product_tags` ADD `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)"
            )
        }

        const rows = await queryRunner.query("SELECT `id`, `title`, `slug` FROM `product_tags`")
        const usedSlugs = new Set<string>()
        for (const row of rows) {
            let slug = slugify(row.slug || row.title || `tag-${row.id}`)
            if (usedSlugs.has(slug)) {
                slug = `${slug}-${row.id}`
            }
            usedSlugs.add(slug)
            await queryRunner.query("UPDATE `product_tags` SET `slug` = ? WHERE `id` = ?", [slug, row.id])
        }

        await queryRunner.query("ALTER TABLE `product_tags` MODIFY `slug` varchar(120) NOT NULL")

        const tableAfterColumns = await queryRunner.getTable("product_tags")
        const hasSlugIndex = Boolean(tableAfterColumns?.indices.some((index) => index.name === "IDX_product_tags_slug"))
        if (!hasSlugIndex) {
            await queryRunner.query("CREATE UNIQUE INDEX `IDX_product_tags_slug` ON `product_tags` (`slug`)")
        }

        const tableAfterSlugIndex = await queryRunner.getTable("product_tags")
        const hasTypeIndex = Boolean(tableAfterSlugIndex?.indices.some((index) => index.name === "IDX_product_tags_type"))
        if (!hasTypeIndex) {
            await queryRunner.query("CREATE INDEX `IDX_product_tags_type` ON `product_tags` (`type`)")
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const hasProductTags = await queryRunner.hasTable("product_tags")
        if (!hasProductTags) return

        const table = await queryRunner.getTable("product_tags")
        if (table?.indices.some((index) => index.name === "IDX_product_tags_type")) {
            await queryRunner.query("DROP INDEX `IDX_product_tags_type` ON `product_tags`")
        }
        const tableAfterTypeDrop = await queryRunner.getTable("product_tags")
        if (tableAfterTypeDrop?.indices.some((index) => index.name === "IDX_product_tags_slug")) {
            await queryRunner.query("DROP INDEX `IDX_product_tags_slug` ON `product_tags`")
        }

        for (const column of ["updatedAt", "createdAt", "sortOrder", "isActive", "colorHex", "type", "slug"]) {
            if (await queryRunner.hasColumn("product_tags", column)) {
                await queryRunner.query(`ALTER TABLE \`product_tags\` DROP COLUMN \`${column}\``)
            }
        }

        await queryRunner.query("ALTER TABLE `product_tags` MODIFY `title` varchar(20) NOT NULL")
    }
}

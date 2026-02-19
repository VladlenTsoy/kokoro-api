import {Module} from "@nestjs/common"
import {ClientProductVariantModule} from "./product-variant/product-variant.module"
import {ClientProductCategoryModule} from "./product-category/product-category.module"

@Module({
    imports: [ClientProductVariantModule, ClientProductCategoryModule]
})
export class ClientModule {}

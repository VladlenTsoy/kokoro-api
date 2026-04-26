import {Module} from "@nestjs/common"
import {ClientProductVariantModule} from "./product-variant/product-variant.module"
import {ClientProductCategoryModule} from "./product-category/product-category.module"
import {ClientCollectionModule} from "./collection/collection.module"
import {ClientOrderModule} from "./order/order.module"
import {ClientAuthModule} from "./auth/client-auth.module"

@Module({
    imports: [ClientAuthModule, ClientProductVariantModule, ClientProductCategoryModule, ClientCollectionModule, ClientOrderModule]
})
export class ClientModule {}

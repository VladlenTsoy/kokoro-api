import {Module} from "@nestjs/common"
import {ClientProductVariantModule} from "./product-variant/product-variant.module"
import {ClientProductCategoryModule} from "./product-category/product-category.module"
import {ClientCollectionModule} from "./collection/collection.module"
import {ClientOrderModule} from "./order/order.module"
import {ClientAuthModule} from "./auth/client-auth.module"
import {ClientProfileModule} from "./profile/client-profile.module"
import {ClientProductTagModule} from "./product-tag/product-tag.module"

@Module({
    imports: [
        ClientAuthModule,
        ClientProfileModule,
        ClientProductVariantModule,
        ClientProductTagModule,
        ClientProductCategoryModule,
        ClientCollectionModule,
        ClientOrderModule
    ]
})
export class ClientModule {}

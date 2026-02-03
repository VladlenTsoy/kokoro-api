import {Module} from "@nestjs/common"
import {ClientProductVariantModule} from "./product-variant/product-variant.module"

@Module({
    imports: [ClientProductVariantModule]
})
export class ClientModule {}

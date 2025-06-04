import {Module} from "@nestjs/common"
import {ProductVariantModule} from "./product-variant/product-variant.module"
import {SizeModule} from "./size/size.module"
import {ColorModule} from "./color/color.module"
import {AppService} from "../../app.service"
import {AwsModule} from "./aws/aws.module"
import {ProductPropertyModule} from "./product-property/product-property.module"
import {ProductCategoryModule} from "./product-category/product-category.module"
import {ProductTagModule} from "./product-tag/product-tag.module"
import {ProductModule} from "./product/product.module"
import {ProductVariantSizeModule} from "./product-variant-size/product-variant-size.module"
import {ProductVariantImageModule} from "./product-variant-image/product-variant-image.module"

@Module({
    imports: [
        ProductVariantModule,
        ColorModule,
        SizeModule,
        AwsModule,
        ProductCategoryModule,
        ProductPropertyModule,
        ProductTagModule,
        ProductModule,
        ProductVariantSizeModule,
        ProductVariantImageModule
    ],
    providers: [AppService]
})
export class AdminModule {}

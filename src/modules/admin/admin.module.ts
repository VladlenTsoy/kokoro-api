import {Module} from "@nestjs/common"
import {ProductModule} from "./product/product.module"
import {ProductColorModule} from "./product-color/product-color.module"
import {ProductColorTagModule} from "./product-color-tag/product-color-tag.module"
import {SizeModule} from "./size/size.module"
import {ColorModule} from "./color/color.module"
import {ProductCategoryModule} from "./product-category/product-category.module"
import {AppService} from "../../app.service"

@Module({
    imports: [
        ProductModule,
        ProductColorModule,
        ColorModule,
        ProductColorTagModule,
        SizeModule,
        ProductCategoryModule
    ],
    providers: [AppService]
})

export class AdminModule {

}

import {Module} from "@nestjs/common"
import {ProductModule} from "./product/product.module"
import {ProductColorModule} from "./product-color/product-color.module"
import {SizeModule} from "./size/size.module"
import {ColorModule} from "./color/color.module"
import {AppService} from "../../app.service"

@Module({
    imports: [ProductModule, ProductColorModule, ColorModule, SizeModule],
    providers: [AppService]
})
export class AdminModule {}

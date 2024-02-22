import {Module} from "@nestjs/common"
import {ProductColorModule} from "./product-color/product-color.module"
import {SizeModule} from "./size/size.module"
import {ColorModule} from "./color/color.module"
import {AppService} from "../../app.service"

@Module({
    imports: [ProductColorModule, ColorModule, SizeModule],
    providers: [AppService]
})
export class AdminModule {}

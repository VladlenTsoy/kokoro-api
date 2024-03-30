import {Module} from "@nestjs/common"
import {ProductColorModule} from "./product-color/product-color.module"
import {SizeModule} from "./size/size.module"
import {ColorModule} from "./color/color.module"
import {AppService} from "../../app.service"
import {AwsModule} from "./aws/aws.module"

@Module({
    imports: [ProductColorModule, ColorModule, SizeModule, AwsModule],
    providers: [AppService]
})
export class AdminModule {}

import {Module} from "@nestjs/common"
import {ProductColorModule} from "./product-color/product-color.module"
import {SizeModule} from "./size/size.module"
import {ColorModule} from "./color/color.module"
import {AppService} from "../../app.service"
import {AwsModule} from "./aws/aws.module"
import {ProductPropertyModule} from "./product-property/product-property.module"
import {ProductCategoryModule} from "./product-category/product-category.module"
import { ProductColorTagModule } from './product-color-tag/product-color-tag.module';

@Module({
    imports: [
        ProductColorModule,
        ColorModule,
        SizeModule,
        AwsModule,
        ProductPropertyModule,
        ProductCategoryModule,
        ProductPropertyModule,
        ProductColorTagModule
    ],
    providers: [AppService]
})
export class AdminModule {}

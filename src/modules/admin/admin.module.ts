import {Module} from "@nestjs/common"
import {APP_GUARD} from "@nestjs/core"
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
import {ProductVariantMeasurementModule} from "./product-variant-measurement/product-variant-measurement.module"
import {ProductVariantDiscountModule} from "./product-variant-discount/product-variant-discount.module"
import {SalesPointModule} from "./sales-point/sales-point.module"
import {ProductStorageModule} from "./product-storage/product-storage.module"
import {OrderStatusModule} from "./order-status/order-status.module"
import {PaymentMethodModule} from "./payment-method/payment-method.module"
import {SourceModule} from "./source/source.module"
import {DeliveryTypeModule} from "./delivery-type/delivery-type.module"
import {CountryModule} from "./country/country.module"
import {CityModule} from "./city/city.module"
import {OrderAddressModule} from "./order-address/order-address.module"
import {OrderModule} from "./order/order.module"
import {OrderItemModule} from "./order-item/order-item.module"
import {ProductVariantStatusModule} from "./product-variant-status/product-variant-status.module"
import {RoleModule} from "./role/role.module"
import {EmployeeModule} from "./employee/employee.module"
import {AuthModule} from "./auth/auth.module"
import {AdminAuthGuard} from "./auth/guards/admin-auth.guard"
import {AdminRolesGuard} from "./auth/guards/admin-roles.guard"
import {CollectionModule} from "./collection/collection.module"
import {AdminClientModule} from "./client/client.module"
import {PromoCodeModule} from "./promo-code/promo-code.module"
import {IntegrationModule} from "./integration/integration.module"

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
        ProductVariantImageModule,
        ProductVariantMeasurementModule,
        ProductVariantDiscountModule,
        SalesPointModule,
        ProductStorageModule,
        OrderStatusModule,
        PaymentMethodModule,
        SourceModule,
        DeliveryTypeModule,
        CountryModule,
        CityModule,
        OrderAddressModule,
        OrderModule,
        OrderItemModule,
        OrderStatusModule,
        ProductVariantStatusModule,
        RoleModule,
        EmployeeModule,
        AuthModule,
        CollectionModule,
        AdminClientModule,
        PromoCodeModule,
        IntegrationModule
    ],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: AdminAuthGuard
        },
        {
            provide: APP_GUARD,
            useClass: AdminRolesGuard
        }
    ]
})
export class AdminModule {}

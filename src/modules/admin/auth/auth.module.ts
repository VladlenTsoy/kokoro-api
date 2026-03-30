import {Module} from "@nestjs/common"
import {TypeOrmModule} from "@nestjs/typeorm"
import {AuthController} from "./auth.controller"
import {AuthService} from "./auth.service"
import {AuthCryptoService} from "./auth-crypto.service"
import {EmployeeModule} from "../employee/employee.module"
import {RoleModule} from "../role/role.module"
import {EmployeeEntity} from "../employee/entities/employee.entity"
import {AdminRefreshTokenEntity} from "./entities/admin-refresh-token.entity"

@Module({
    imports: [TypeOrmModule.forFeature([EmployeeEntity, AdminRefreshTokenEntity]), EmployeeModule, RoleModule],
    controllers: [AuthController],
    providers: [AuthService, AuthCryptoService],
    exports: [AuthCryptoService]
})
export class AuthModule {}

import {Module} from "@nestjs/common"
import {TypeOrmModule} from "@nestjs/typeorm"
import {EmployeeEntity} from "./entities/employee.entity"
import {EmployeeService} from "./employee.service"
import {EmployeeController} from "./employee.controller"
import {RoleModule} from "../role/role.module"
import {AuthCryptoService} from "../auth/auth-crypto.service"

@Module({
    imports: [TypeOrmModule.forFeature([EmployeeEntity]), RoleModule],
    controllers: [EmployeeController],
    providers: [EmployeeService, AuthCryptoService],
    exports: [EmployeeService]
})
export class EmployeeModule {}

import {Body, Controller, Delete, Get, Param, Patch, Post, UsePipes, ValidationPipe} from "@nestjs/common"
import {ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger"
import {EmployeeService} from "./employee.service"
import {CreateEmployeeDto} from "./dto/create-employee.dto"
import {UpdateEmployeeDto} from "./dto/update-employee.dto"
import {AssignRolesDto} from "./dto/assign-roles.dto"
import {EmployeeEntity} from "./entities/employee.entity"
import {AdminPermissions} from "../auth/decorators/permissions.decorator"

@ApiTags("Admin Employees")
@ApiBearerAuth("admin-bearer")
@Controller("admin/employees")
export class EmployeeController {
    constructor(private readonly employeeService: EmployeeService) {}

    @Post()
    @AdminPermissions("staff.manage")
    @ApiOperation({summary: "Create employee"})
    @ApiBody({type: CreateEmployeeDto})
    @ApiResponse({status: 200, type: EmployeeEntity})
    @UsePipes(new ValidationPipe({transform: true}))
    create(@Body() createEmployeeDto: CreateEmployeeDto) {
        return this.employeeService.create(createEmployeeDto)
    }

    @Get()
    @AdminPermissions("staff.read")
    @ApiOperation({summary: "Get all employees"})
    @ApiResponse({status: 200, type: EmployeeEntity, isArray: true})
    findAll() {
        return this.employeeService.findAll()
    }

    @Get(":id")
    @AdminPermissions("staff.read")
    @ApiOperation({summary: "Get employee by id"})
    @ApiResponse({status: 200, type: EmployeeEntity})
    findOne(@Param("id") id: string) {
        return this.employeeService.findOne(+id)
    }

    @Patch(":id")
    @AdminPermissions("staff.manage")
    @ApiOperation({summary: "Update employee by id"})
    @ApiBody({type: UpdateEmployeeDto})
    @ApiResponse({status: 200, type: EmployeeEntity})
    @UsePipes(new ValidationPipe({transform: true}))
    update(@Param("id") id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
        return this.employeeService.update(+id, updateEmployeeDto)
    }

    @Patch(":id/roles")
    @AdminPermissions("staff.manage")
    @ApiOperation({summary: "Assign roles to employee"})
    @ApiBody({type: AssignRolesDto})
    @ApiResponse({status: 200, type: EmployeeEntity})
    @UsePipes(new ValidationPipe({transform: true}))
    assignRoles(@Param("id") id: string, @Body() assignRolesDto: AssignRolesDto) {
        return this.employeeService.assignRoles(+id, assignRolesDto)
    }

    @Delete(":id")
    @AdminPermissions("staff.manage")
    @ApiOperation({summary: "Delete employee by id"})
    @ApiResponse({status: 200})
    remove(@Param("id") id: string) {
        return this.employeeService.remove(+id)
    }
}

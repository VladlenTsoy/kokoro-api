import {Body, Controller, Delete, Get, Param, Patch, Post, UsePipes, ValidationPipe} from "@nestjs/common"
import {ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger"
import {EmployeeService} from "./employee.service"
import {CreateEmployeeDto} from "./dto/create-employee.dto"
import {UpdateEmployeeDto} from "./dto/update-employee.dto"
import {AssignRolesDto} from "./dto/assign-roles.dto"
import {Roles} from "../auth/decorators/roles.decorator"
import {EmployeeEntity} from "./entities/employee.entity"

@ApiTags("Admin Employees")
@ApiBearerAuth("admin-bearer")
@Controller("admin/employees")
export class EmployeeController {
    constructor(private readonly employeeService: EmployeeService) {}

    @Post()
    @Roles("SUPER_ADMIN")
    @ApiOperation({summary: "Create employee"})
    @ApiBody({type: CreateEmployeeDto})
    @ApiResponse({status: 200, type: EmployeeEntity})
    @UsePipes(new ValidationPipe({transform: true}))
    create(@Body() createEmployeeDto: CreateEmployeeDto) {
        return this.employeeService.create(createEmployeeDto)
    }

    @Get()
    @Roles("SUPER_ADMIN")
    @ApiOperation({summary: "Get all employees"})
    @ApiResponse({status: 200, type: EmployeeEntity, isArray: true})
    findAll() {
        return this.employeeService.findAll()
    }

    @Get(":id")
    @Roles("SUPER_ADMIN")
    @ApiOperation({summary: "Get employee by id"})
    @ApiResponse({status: 200, type: EmployeeEntity})
    findOne(@Param("id") id: string) {
        return this.employeeService.findOne(+id)
    }

    @Patch(":id")
    @Roles("SUPER_ADMIN")
    @ApiOperation({summary: "Update employee by id"})
    @ApiBody({type: UpdateEmployeeDto})
    @ApiResponse({status: 200, type: EmployeeEntity})
    @UsePipes(new ValidationPipe({transform: true}))
    update(@Param("id") id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
        return this.employeeService.update(+id, updateEmployeeDto)
    }

    @Patch(":id/roles")
    @Roles("SUPER_ADMIN")
    @ApiOperation({summary: "Assign roles to employee"})
    @ApiBody({type: AssignRolesDto})
    @ApiResponse({status: 200, type: EmployeeEntity})
    @UsePipes(new ValidationPipe({transform: true}))
    assignRoles(@Param("id") id: string, @Body() assignRolesDto: AssignRolesDto) {
        return this.employeeService.assignRoles(+id, assignRolesDto)
    }

    @Delete(":id")
    @Roles("SUPER_ADMIN")
    @ApiOperation({summary: "Delete employee by id"})
    @ApiResponse({status: 200})
    remove(@Param("id") id: string) {
        return this.employeeService.remove(+id)
    }
}

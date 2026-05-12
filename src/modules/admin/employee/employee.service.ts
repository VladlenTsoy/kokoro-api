import {ConflictException, Injectable, NotFoundException} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {EmployeeEntity} from "./entities/employee.entity"
import {CreateEmployeeDto} from "./dto/create-employee.dto"
import {UpdateEmployeeDto} from "./dto/update-employee.dto"
import {AssignRolesDto} from "./dto/assign-roles.dto"
import {RoleService} from "../role/role.service"
import {AuthCryptoService} from "../auth/auth-crypto.service"
import {ALL_ADMIN_PERMISSION_CODES, isSuperAdmin} from "../auth/permissions/admin-permissions"
import {SalesPointEntity} from "../sales-point/entities/sales-point.entity"

@Injectable()
export class EmployeeService {
    constructor(
        @InjectRepository(EmployeeEntity)
        private readonly employeeRepository: Repository<EmployeeEntity>,
        @InjectRepository(SalesPointEntity)
        private readonly salesPointRepository: Repository<SalesPointEntity>,
        private readonly roleService: RoleService,
        private readonly authCryptoService: AuthCryptoService
    ) {}

    private sanitize(employee: EmployeeEntity) {
        const {passwordHash: _passwordHash, passwordSalt: _passwordSalt, ...safeEmployee} = employee
        const roleCodes = (employee.roles || []).filter((role) => role.isActive).map((role) => role.code)
        const permissions = isSuperAdmin(roleCodes)
            ? ALL_ADMIN_PERMISSION_CODES
            : Array.from(
                  new Set(
                      (employee.roles || []).filter((role) => role.isActive).flatMap((role) => role.permissions || [])
                  )
              )

        return {
            ...safeEmployee,
            permissions,
            roles: (employee.roles || []).map((role) => ({
                id: role.id,
                code: role.code,
                name: role.name,
                isActive: role.isActive,
                permissions: isSuperAdmin([role.code]) ? ALL_ADMIN_PERMISSION_CODES : role.permissions || []
            }))
        }
    }

    async create(createEmployeeDto: CreateEmployeeDto) {
        const existing = await this.employeeRepository.findOneBy({email: createEmployeeDto.email.toLowerCase().trim()})
        if (existing) {
            throw new ConflictException("Employee with this email already exists")
        }

        const passwordData = this.authCryptoService.hashPassword(createEmployeeDto.password)
        const roles = createEmployeeDto.roleIds?.length
            ? await this.roleService.findByIds(createEmployeeDto.roleIds)
            : []

        const salesPoints = createEmployeeDto.salesPointIds?.length
            ? await this.salesPointRepository.findByIds(createEmployeeDto.salesPointIds)
            : []

        const employee = this.employeeRepository.create({
            email: createEmployeeDto.email.toLowerCase().trim(),
            firstName: createEmployeeDto.firstName.trim(),
            lastName: createEmployeeDto.lastName.trim(),
            phone: createEmployeeDto.phone?.trim(),
            isActive: createEmployeeDto.isActive ?? true,
            passwordHash: passwordData.hash,
            passwordSalt: passwordData.salt,
            roles,
            salesPoints
        })

        const savedEmployee = await this.employeeRepository.save(employee)
        return this.sanitize(savedEmployee)
    }

    async findAll() {
        const employees = await this.employeeRepository.find({order: {id: "DESC"}})
        return employees.map((employee) => this.sanitize(employee))
    }

    async findOne(id: number) {
        const employee = await this.employeeRepository.findOne({where: {id}})
        if (!employee) throw new NotFoundException("Employee not found")
        return this.sanitize(employee)
    }

    async findOneWithSecretsByEmail(email: string) {
        return this.employeeRepository.findOne({where: {email: email.toLowerCase().trim()}})
    }

    async findOneWithSecretsById(id: number) {
        return this.employeeRepository.findOne({where: {id}})
    }

    async update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
        const employee = await this.findOneWithSecretsById(id)
        if (!employee) throw new NotFoundException("Employee not found")

        if (updateEmployeeDto.email && updateEmployeeDto.email.toLowerCase().trim() !== employee.email) {
            const existing = await this.employeeRepository.findOneBy({
                email: updateEmployeeDto.email.toLowerCase().trim()
            })
            if (existing) {
                throw new ConflictException("Employee with this email already exists")
            }
            employee.email = updateEmployeeDto.email.toLowerCase().trim()
        }

        if (updateEmployeeDto.firstName !== undefined) employee.firstName = updateEmployeeDto.firstName.trim()
        if (updateEmployeeDto.lastName !== undefined) employee.lastName = updateEmployeeDto.lastName.trim()
        if (updateEmployeeDto.phone !== undefined) employee.phone = updateEmployeeDto.phone?.trim()
        if (updateEmployeeDto.isActive !== undefined) employee.isActive = updateEmployeeDto.isActive

        if (updateEmployeeDto.password) {
            const passwordData = this.authCryptoService.hashPassword(updateEmployeeDto.password)
            employee.passwordHash = passwordData.hash
            employee.passwordSalt = passwordData.salt
        }

        if (updateEmployeeDto.roleIds) {
            employee.roles = await this.roleService.findByIds(updateEmployeeDto.roleIds)
        }
        if (updateEmployeeDto.salesPointIds) {
            employee.salesPoints = updateEmployeeDto.salesPointIds.length
                ? await this.salesPointRepository.findByIds(updateEmployeeDto.salesPointIds)
                : []
        }

        const savedEmployee = await this.employeeRepository.save(employee)
        return this.sanitize(savedEmployee)
    }

    async assignRoles(id: number, assignRolesDto: AssignRolesDto) {
        const employee = await this.findOneWithSecretsById(id)
        if (!employee) throw new NotFoundException("Employee not found")

        employee.roles = await this.roleService.findByIds(assignRolesDto.roleIds)
        const savedEmployee = await this.employeeRepository.save(employee)

        return this.sanitize(savedEmployee)
    }

    async remove(id: number) {
        const employee = await this.findOneWithSecretsById(id)
        if (!employee) throw new NotFoundException("Employee not found")

        await this.employeeRepository.remove(employee)
        return {message: "Employee has been successfully removed"}
    }

    sanitizeEmployee(employee: EmployeeEntity) {
        return this.sanitize(employee)
    }
}

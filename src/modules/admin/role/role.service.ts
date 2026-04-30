import {BadRequestException, ConflictException, Injectable, NotFoundException} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {In, Repository} from "typeorm"
import {CreateRoleDto} from "./dto/create-role.dto"
import {UpdateRoleDto} from "./dto/update-role.dto"
import {RoleEntity} from "./entities/role.entity"
import {
    ADMIN_PERMISSION_CATALOG,
    ALL_ADMIN_PERMISSION_CODES,
    isSuperAdmin,
    normalizeAdminPermissions
} from "../auth/permissions/admin-permissions"

@Injectable()
export class RoleService {
    constructor(
        @InjectRepository(RoleEntity)
        private readonly roleRepository: Repository<RoleEntity>
    ) {}

    private buildRoleResponse(role: RoleEntity): RoleEntity {
        role.permissions = isSuperAdmin([role.code]) ? ALL_ADMIN_PERMISSION_CODES : role.permissions || []
        return role
    }

    private normalizeAndValidatePermissions(permissions?: string[] | null) {
        const normalized = normalizeAdminPermissions(permissions)

        if (normalized.invalidPermissions.length) {
            throw new BadRequestException(`Unknown permission code(s): ${normalized.invalidPermissions.join(", ")}`)
        }

        return normalized.permissions
    }

    async create(createRoleDto: CreateRoleDto) {
        const normalizedCode = createRoleDto.code.toUpperCase().trim()
        const existing = await this.roleRepository.findOneBy({code: normalizedCode})
        if (existing) {
            throw new ConflictException("Role with this code already exists")
        }
        const permissions = isSuperAdmin([normalizedCode])
            ? ALL_ADMIN_PERMISSION_CODES
            : this.normalizeAndValidatePermissions(createRoleDto.permissions)

        const role = this.roleRepository.create({
            ...createRoleDto,
            code: normalizedCode,
            name: createRoleDto.name.trim(),
            permissions
        })

        return this.buildRoleResponse(await this.roleRepository.save(role))
    }

    findAll() {
        return this.roleRepository.find({order: {id: "DESC"}}).then((roles) => roles.map((role) => this.buildRoleResponse(role)))
    }

    async findOne(id: number) {
        const role = await this.roleRepository.findOneBy({id})
        if (!role) throw new NotFoundException("Role not found")
        return this.buildRoleResponse(role)
    }

    async update(id: number, updateRoleDto: UpdateRoleDto) {
        const role = await this.roleRepository.findOneBy({id})
        if (!role) throw new NotFoundException("Role not found")

        if (updateRoleDto.code && updateRoleDto.code.toUpperCase().trim() !== role.code) {
            const existing = await this.roleRepository.findOneBy({code: updateRoleDto.code.toUpperCase().trim()})
            if (existing) {
                throw new ConflictException("Role with this code already exists")
            }
            role.code = updateRoleDto.code.toUpperCase().trim()
        }

        if (updateRoleDto.name !== undefined) role.name = updateRoleDto.name.trim()
        if (updateRoleDto.isActive !== undefined) role.isActive = updateRoleDto.isActive
        if (updateRoleDto.permissions !== undefined) {
            role.permissions = isSuperAdmin([role.code])
                ? ALL_ADMIN_PERMISSION_CODES
                : this.normalizeAndValidatePermissions(updateRoleDto.permissions)
        }

        return this.buildRoleResponse(await this.roleRepository.save(role))
    }

    async remove(id: number) {
        const role = await this.roleRepository.findOneBy({id})
        if (!role) throw new NotFoundException("Role not found")
        if (isSuperAdmin([role.code])) {
            throw new BadRequestException("SUPER_ADMIN role cannot be removed")
        }
        await this.roleRepository.remove(role)
        return {message: "Role has been successfully removed"}
    }

    findByIds(roleIds: number[]) {
        if (!roleIds.length) return Promise.resolve([])
        return this.roleRepository.find({where: {id: In(roleIds)}})
    }

    async findByCode(code: string) {
        return this.roleRepository.findOneBy({code: code.toUpperCase().trim()})
    }

    getPermissionCatalog() {
        return ADMIN_PERMISSION_CATALOG
    }

    async getPermissionsForRoleCodes(roleCodes: string[]) {
        if (!roleCodes.length) return []
        if (isSuperAdmin(roleCodes)) return ALL_ADMIN_PERMISSION_CODES

        const roles = await this.roleRepository.find({
            where: {code: In(roleCodes.map((roleCode) => roleCode.toUpperCase().trim())), isActive: true}
        })

        return Array.from(new Set(roles.flatMap((role) => role.permissions || [])))
    }
}

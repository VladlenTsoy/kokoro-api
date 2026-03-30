import {ConflictException, Injectable, NotFoundException} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {In, Repository} from "typeorm"
import {CreateRoleDto} from "./dto/create-role.dto"
import {UpdateRoleDto} from "./dto/update-role.dto"
import {RoleEntity} from "./entities/role.entity"

@Injectable()
export class RoleService {
    constructor(
        @InjectRepository(RoleEntity)
        private readonly roleRepository: Repository<RoleEntity>
    ) {}

    async create(createRoleDto: CreateRoleDto) {
        const normalizedCode = createRoleDto.code.toUpperCase().trim()
        const existing = await this.roleRepository.findOneBy({code: normalizedCode})
        if (existing) {
            throw new ConflictException("Role with this code already exists")
        }

        const role = this.roleRepository.create({
            ...createRoleDto,
            code: normalizedCode,
            name: createRoleDto.name.trim()
        })

        return await this.roleRepository.save(role)
    }

    findAll() {
        return this.roleRepository.find({order: {id: "DESC"}})
    }

    async findOne(id: number) {
        const role = await this.roleRepository.findOneBy({id})
        if (!role) throw new NotFoundException("Role not found")
        return role
    }

    async update(id: number, updateRoleDto: UpdateRoleDto) {
        const role = await this.findOne(id)

        if (updateRoleDto.code && updateRoleDto.code.toUpperCase().trim() !== role.code) {
            const existing = await this.roleRepository.findOneBy({code: updateRoleDto.code.toUpperCase().trim()})
            if (existing) {
                throw new ConflictException("Role with this code already exists")
            }
            role.code = updateRoleDto.code.toUpperCase().trim()
        }

        if (updateRoleDto.name !== undefined) role.name = updateRoleDto.name.trim()
        if (updateRoleDto.isActive !== undefined) role.isActive = updateRoleDto.isActive

        return await this.roleRepository.save(role)
    }

    async remove(id: number) {
        const role = await this.findOne(id)
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
}

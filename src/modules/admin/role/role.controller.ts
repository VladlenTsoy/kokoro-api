import {Body, Controller, Delete, Get, Param, Patch, Post, UsePipes, ValidationPipe} from "@nestjs/common"
import {ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger"
import {RoleService} from "./role.service"
import {CreateRoleDto} from "./dto/create-role.dto"
import {UpdateRoleDto} from "./dto/update-role.dto"
import {RoleEntity} from "./entities/role.entity"
import {Roles} from "../auth/decorators/roles.decorator"

@ApiTags("Admin Roles")
@ApiBearerAuth("admin-bearer")
@Controller("admin/roles")
export class RoleController {
    constructor(private readonly roleService: RoleService) {}

    @Post()
    @Roles("SUPER_ADMIN")
    @ApiOperation({summary: "Create role"})
    @ApiBody({type: CreateRoleDto})
    @ApiResponse({status: 200, type: RoleEntity})
    @UsePipes(new ValidationPipe({transform: true}))
    create(@Body() createRoleDto: CreateRoleDto) {
        return this.roleService.create(createRoleDto)
    }

    @Get()
    @Roles("SUPER_ADMIN")
    @ApiOperation({summary: "Get all roles"})
    @ApiResponse({status: 200, type: RoleEntity, isArray: true})
    findAll() {
        return this.roleService.findAll()
    }

    @Get(":id")
    @Roles("SUPER_ADMIN")
    @ApiOperation({summary: "Get role by id"})
    @ApiResponse({status: 200, type: RoleEntity})
    findOne(@Param("id") id: string) {
        return this.roleService.findOne(+id)
    }

    @Patch(":id")
    @Roles("SUPER_ADMIN")
    @ApiOperation({summary: "Update role"})
    @ApiBody({type: UpdateRoleDto})
    @ApiResponse({status: 200, type: RoleEntity})
    @UsePipes(new ValidationPipe({transform: true}))
    update(@Param("id") id: string, @Body() updateRoleDto: UpdateRoleDto) {
        return this.roleService.update(+id, updateRoleDto)
    }

    @Delete(":id")
    @Roles("SUPER_ADMIN")
    @ApiOperation({summary: "Delete role"})
    @ApiResponse({status: 200})
    remove(@Param("id") id: string) {
        return this.roleService.remove(+id)
    }
}

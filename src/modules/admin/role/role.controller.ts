import {Body, Controller, Delete, Get, Param, Patch, Post, UsePipes, ValidationPipe} from "@nestjs/common"
import {ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger"
import {RoleService} from "./role.service"
import {CreateRoleDto} from "./dto/create-role.dto"
import {UpdateRoleDto} from "./dto/update-role.dto"
import {RoleEntity} from "./entities/role.entity"
import {AdminPermissions} from "../auth/decorators/permissions.decorator"

@ApiTags("Admin Roles")
@ApiBearerAuth("admin-bearer")
@Controller("admin/roles")
export class RoleController {
    constructor(private readonly roleService: RoleService) {}

    @Get("permissions")
    @AdminPermissions("staff.read")
    @ApiOperation({summary: "Get permission catalog for role builder"})
    getPermissionCatalog() {
        return this.roleService.getPermissionCatalog()
    }

    @Post()
    @AdminPermissions("staff.manage")
    @ApiOperation({summary: "Create role"})
    @ApiBody({type: CreateRoleDto})
    @ApiResponse({status: 200, type: RoleEntity})
    @UsePipes(new ValidationPipe({transform: true}))
    create(@Body() createRoleDto: CreateRoleDto) {
        return this.roleService.create(createRoleDto)
    }

    @Get()
    @AdminPermissions("staff.read")
    @ApiOperation({summary: "Get all roles"})
    @ApiResponse({status: 200, type: RoleEntity, isArray: true})
    findAll() {
        return this.roleService.findAll()
    }

    @Get(":id")
    @AdminPermissions("staff.read")
    @ApiOperation({summary: "Get role by id"})
    @ApiResponse({status: 200, type: RoleEntity})
    findOne(@Param("id") id: string) {
        return this.roleService.findOne(+id)
    }

    @Patch(":id")
    @AdminPermissions("staff.manage")
    @ApiOperation({summary: "Update role"})
    @ApiBody({type: UpdateRoleDto})
    @ApiResponse({status: 200, type: RoleEntity})
    @UsePipes(new ValidationPipe({transform: true}))
    update(@Param("id") id: string, @Body() updateRoleDto: UpdateRoleDto) {
        return this.roleService.update(+id, updateRoleDto)
    }

    @Delete(":id")
    @AdminPermissions("staff.manage")
    @ApiOperation({summary: "Delete role"})
    @ApiResponse({status: 200})
    remove(@Param("id") id: string) {
        return this.roleService.remove(+id)
    }
}

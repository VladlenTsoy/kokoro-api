import {ApiProperty} from "@nestjs/swagger"
import {Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm"
import {EmployeeEntity} from "../../employee/entities/employee.entity"

@Entity("admin_roles")
export class RoleEntity {
    @ApiProperty({example: 1, description: "Role id"})
    @PrimaryGeneratedColumn()
    id: number

    @ApiProperty({example: "SUPER_ADMIN", description: "Role code"})
    @Column({type: "varchar", length: 50, unique: true})
    code: string

    @ApiProperty({example: "Super Admin", description: "Role display name"})
    @Column({type: "varchar", length: 100})
    name: string

    @ApiProperty({example: true, description: "Is role active"})
    @Column({type: "boolean", default: true})
    isActive: boolean

    @ApiProperty({example: ["orders.read", "orders.update"], description: "Admin permission codes", isArray: true})
    @Column({type: "json", nullable: true})
    permissions?: string[] | null

    @ManyToMany(() => EmployeeEntity, (employee) => employee.roles)
    employees: EmployeeEntity[]

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}

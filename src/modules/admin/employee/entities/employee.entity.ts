import {ApiProperty} from "@nestjs/swagger"
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm"
import {RoleEntity} from "../../role/entities/role.entity"
import {SalesPointEntity} from "../../sales-point/entities/sales-point.entity"

@Entity("admin_employees")
export class EmployeeEntity {
    @ApiProperty({example: 1, description: "Employee id"})
    @PrimaryGeneratedColumn()
    id: number

    @ApiProperty({example: "john.doe@kokoro.uz", description: "Email"})
    @Column({type: "varchar", length: 150, unique: true})
    email: string

    @ApiProperty({example: "John", description: "First name"})
    @Column({type: "varchar", length: 100})
    firstName: string

    @ApiProperty({example: "Doe", description: "Last name"})
    @Column({type: "varchar", length: 100})
    lastName: string

    @ApiProperty({example: "+998901234567", description: "Phone", required: false})
    @Column({type: "varchar", length: 30, nullable: true})
    phone?: string

    @Column({type: "varchar", length: 255})
    passwordHash: string

    @Column({type: "varchar", length: 255})
    passwordSalt: string

    @ApiProperty({example: true, description: "Is employee active"})
    @Column({type: "boolean", default: true})
    isActive: boolean

    @ManyToMany(() => RoleEntity, (role) => role.employees, {eager: true})
    @JoinTable({
        name: "admin_employee_roles",
        joinColumn: {name: "employee_id", referencedColumnName: "id"},
        inverseJoinColumn: {name: "role_id", referencedColumnName: "id"}
    })
    roles: RoleEntity[]

    @ManyToMany(() => SalesPointEntity, {eager: true})
    @JoinTable({
        name: "admin_employee_sales_points",
        joinColumn: {name: "employee_id", referencedColumnName: "id"},
        inverseJoinColumn: {name: "sales_point_id", referencedColumnName: "id"}
    })
    salesPoints: SalesPointEntity[]

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}

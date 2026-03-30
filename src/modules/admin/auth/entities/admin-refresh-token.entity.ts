import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm"
import {EmployeeEntity} from "../../employee/entities/employee.entity"

@Entity("admin_refresh_tokens")
export class AdminRefreshTokenEntity {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => EmployeeEntity, {nullable: false, onDelete: "CASCADE"})
    employee: EmployeeEntity

    @Column({type: "varchar", length: 255})
    tokenHash: string

    @Column({type: "varchar", length: 255})
    tokenSalt: string

    @Column({type: "datetime"})
    expiresAt: Date

    @Column({type: "datetime", nullable: true})
    revokedAt?: Date

    @CreateDateColumn()
    createdAt: Date
}

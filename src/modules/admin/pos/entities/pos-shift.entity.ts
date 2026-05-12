import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm"
import {EmployeeEntity} from "../../employee/entities/employee.entity"
import {SalesPointEntity} from "../../sales-point/entities/sales-point.entity"
import {PosDeviceEntity} from "./pos-device.entity"

export enum PosShiftStatus {
    OPEN = "open",
    CLOSED = "closed",
    CANCELLED = "cancelled"
}

@Entity("pos_shifts")
export class PosShiftEntity {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => EmployeeEntity, {nullable: false, onDelete: "RESTRICT"})
    employee: EmployeeEntity

    @ManyToOne(() => SalesPointEntity, {nullable: false, onDelete: "RESTRICT"})
    salesPoint: SalesPointEntity

    @ManyToOne(() => PosDeviceEntity, {nullable: true, onDelete: "SET NULL"})
    device?: PosDeviceEntity | null

    @Column({type: "enum", enum: PosShiftStatus, default: PosShiftStatus.OPEN})
    status: PosShiftStatus

    @Column({type: "datetime"})
    openedAt: Date

    @Column({type: "datetime", nullable: true})
    closedAt?: Date | null

    @Column({type: "int", default: 0})
    openingCashAmount: number

    @Column({type: "int", default: 0})
    closingCashAmount: number

    @Column({type: "int", default: 0})
    expectedCashAmount: number

    @Column({type: "int", default: 0})
    cashDifference: number

    @Column({type: "varchar", length: 255, nullable: true})
    closeComment?: string | null

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}

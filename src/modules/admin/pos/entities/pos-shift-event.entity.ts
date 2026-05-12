import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm"
import {EmployeeEntity} from "../../employee/entities/employee.entity"
import {PosShiftEntity} from "./pos-shift.entity"

export enum PosShiftEventType {
    OPEN = "open",
    CLOSE = "close",
    CASH_IN = "cash_in",
    CASH_OUT = "cash_out",
    SALE = "sale",
    REFUND = "refund",
    CANCEL = "cancel",
    MANAGER_OVERRIDE = "manager_override"
}

@Entity("pos_shift_events")
export class PosShiftEventEntity {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => PosShiftEntity, {nullable: false, onDelete: "CASCADE"})
    shift: PosShiftEntity

    @ManyToOne(() => EmployeeEntity, {nullable: true, onDelete: "SET NULL"})
    employee?: EmployeeEntity | null

    @Column({type: "enum", enum: PosShiftEventType})
    type: PosShiftEventType

    @Column({type: "json", nullable: true})
    payload?: Record<string, unknown> | null

    @CreateDateColumn()
    createdAt: Date
}

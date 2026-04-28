import {Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn} from "typeorm"

@Entity("client_phone_verifications")
export class ClientPhoneVerificationEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Index("IDX_client_phone_verifications_request")
    @Column({type: "varchar", length: 128, unique: true})
    requestId: string

    @Index("IDX_client_phone_verifications_phone")
    @Column({type: "varchar", length: 50})
    phone: string

    @Column({type: "varchar", length: 32})
    status: string

    @Column({type: "int", default: 0})
    attempts: number

    @Column({type: "datetime"})
    expiresAt: Date

    @Column({type: "datetime", nullable: true})
    consumedAt?: Date | null

    @Column({type: "json", nullable: true})
    gatewayResponse?: Record<string, any> | null

    @CreateDateColumn()
    createdAt: Date
}

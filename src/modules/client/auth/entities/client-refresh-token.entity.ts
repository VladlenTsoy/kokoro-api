import {Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm"
import {ClientEntity} from "../../../admin/client/entities/client.entity"

@Entity("client_refresh_tokens")
export class ClientRefreshTokenEntity {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => ClientEntity, {nullable: false, onDelete: "CASCADE"})
    @JoinColumn({name: "clientId"})
    client: ClientEntity

    @Column({type: "varchar", length: 255})
    tokenHash: string

    @Column({type: "varchar", length: 255})
    tokenSalt: string

    @Index("IDX_client_refresh_tokens_expires")
    @Column({type: "datetime"})
    expiresAt: Date

    @Column({type: "datetime", nullable: true})
    revokedAt?: Date

    @CreateDateColumn()
    createdAt: Date
}

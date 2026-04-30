import {ForbiddenException, Injectable, NotFoundException} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {ClientEntity} from "../../admin/client/entities/client.entity"
import {ClientAddressEntity} from "../../admin/client-address/entities/client-address.entity"
import {UpdateClientProfileDto} from "./dto/update-client-profile.dto"
import {CreateClientAddressDto} from "./dto/create-client-address.dto"
import {UpdateClientAddressDto} from "./dto/update-client-address.dto"

@Injectable()
export class ClientProfileService {
    constructor(
        @InjectRepository(ClientEntity)
        private readonly clientRepository: Repository<ClientEntity>,
        @InjectRepository(ClientAddressEntity)
        private readonly addressRepository: Repository<ClientAddressEntity>
    ) {}

    private stableSerialize(value: any): string {
        if (value === null || value === undefined) return ""
        if (Array.isArray(value)) return `[${value.map((item) => this.stableSerialize(item)).join(",")}]`
        if (typeof value === "object") {
            return `{${Object.keys(value)
                .sort()
                .map((key) => `${JSON.stringify(key)}:${this.stableSerialize(value[key])}`)
                .join(",")}}`
        }
        return JSON.stringify(value)
    }

    private sanitizeClient(client: ClientEntity) {
        return {
            id: client.id,
            name: client.name,
            phone: client.phone || null,
            bonusBalance: client.bonusBalance || 0,
            isActive: client.isActive,
            createdAt: client.createdAt,
            lastLoginAt: client.lastLoginAt || null
        }
    }

    async me(clientId: number) {
        const client = await this.clientRepository.findOneBy({id: clientId})
        if (!client || !client.isActive) throw new ForbiddenException("Client is not active")
        return this.sanitizeClient(client)
    }

    async updateProfile(clientId: number, dto: UpdateClientProfileDto) {
        const client = await this.clientRepository.findOneBy({id: clientId})
        if (!client || !client.isActive) throw new ForbiddenException("Client is not active")
        if (dto.name?.trim()) client.name = dto.name.trim()
        await this.clientRepository.save(client)
        return this.sanitizeClient(client)
    }

    async findAddresses(clientId: number) {
        return this.addressRepository.find({
            where: {client: {id: clientId}},
            order: {id: "DESC"}
        })
    }

    async createAddress(clientId: number, dto: CreateClientAddressDto) {
        const client = await this.clientRepository.findOneBy({id: clientId})
        if (!client || !client.isActive) throw new ForbiddenException("Client is not active")
        const address = this.addressRepository.create({
            client,
            address: dto.address.trim(),
            location: dto.location || null,
            locationHash: this.stableSerialize(dto.location || null)
        })
        return this.addressRepository.save(address)
    }

    async updateAddress(clientId: number, addressId: number, dto: UpdateClientAddressDto) {
        const address = await this.addressRepository.findOne({
            where: {id: addressId},
            relations: {client: true}
        })
        if (!address) throw new NotFoundException("Address not found")
        if (address.client.id !== clientId) throw new ForbiddenException("Address is not available")

        if (dto.address !== undefined) address.address = dto.address.trim()
        if (dto.location !== undefined) {
            address.location = dto.location || null
            address.locationHash = this.stableSerialize(dto.location || null)
        }

        return this.addressRepository.save(address)
    }

    async removeAddress(clientId: number, addressId: number) {
        const address = await this.addressRepository.findOne({
            where: {id: addressId},
            relations: {client: true}
        })
        if (!address) throw new NotFoundException("Address not found")
        if (address.client.id !== clientId) throw new ForbiddenException("Address is not available")

        await this.addressRepository.delete(address.id)
        return {message: "Address deleted"}
    }
}

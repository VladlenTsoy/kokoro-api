import {PartialType} from "@nestjs/swagger"
import {CreateClientAddressDto} from "./create-client-address.dto"

export class UpdateClientAddressDto extends PartialType(CreateClientAddressDto) {}

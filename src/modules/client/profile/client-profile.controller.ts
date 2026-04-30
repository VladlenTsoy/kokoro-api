import {Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, UsePipes, ValidationPipe} from "@nestjs/common"
import {ApiBearerAuth, ApiOperation, ApiTags} from "@nestjs/swagger"
import {ClientAuthGuard} from "../auth/guards/client-auth.guard"
import {CurrentClient} from "../auth/decorators/current-client.decorator"
import {ClientAuthenticatedUser} from "../auth/types/client-authenticated-user.type"
import {ClientProfileService} from "./client-profile.service"
import {UpdateClientProfileDto} from "./dto/update-client-profile.dto"
import {CreateClientAddressDto} from "./dto/create-client-address.dto"
import {UpdateClientAddressDto} from "./dto/update-client-address.dto"

@ApiTags("Client Profile")
@ApiBearerAuth("client-bearer")
@UseGuards(ClientAuthGuard)
@UsePipes(new ValidationPipe({transform: true}))
@Controller("client")
export class ClientProfileController {
    constructor(private readonly clientProfileService: ClientProfileService) {}

    @Get("profile")
    @ApiOperation({summary: "Get current client profile"})
    me(@CurrentClient() clientUser: ClientAuthenticatedUser) {
        return this.clientProfileService.me(clientUser.id)
    }

    @Patch("profile")
    @ApiOperation({summary: "Update current client profile"})
    updateProfile(@CurrentClient() clientUser: ClientAuthenticatedUser, @Body() dto: UpdateClientProfileDto) {
        return this.clientProfileService.updateProfile(clientUser.id, dto)
    }

    @Get("addresses")
    @ApiOperation({summary: "Get current client saved addresses"})
    addresses(@CurrentClient() clientUser: ClientAuthenticatedUser) {
        return this.clientProfileService.findAddresses(clientUser.id)
    }

    @Post("addresses")
    @ApiOperation({summary: "Create current client saved address"})
    createAddress(@CurrentClient() clientUser: ClientAuthenticatedUser, @Body() dto: CreateClientAddressDto) {
        return this.clientProfileService.createAddress(clientUser.id, dto)
    }

    @Patch("addresses/:id")
    @ApiOperation({summary: "Update current client saved address"})
    updateAddress(
        @CurrentClient() clientUser: ClientAuthenticatedUser,
        @Param("id") id: string,
        @Body() dto: UpdateClientAddressDto
    ) {
        return this.clientProfileService.updateAddress(clientUser.id, +id, dto)
    }

    @Delete("addresses/:id")
    @ApiOperation({summary: "Delete current client saved address"})
    removeAddress(@CurrentClient() clientUser: ClientAuthenticatedUser, @Param("id") id: string) {
        return this.clientProfileService.removeAddress(clientUser.id, +id)
    }
}

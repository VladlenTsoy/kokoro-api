import {Injectable, Logger} from "@nestjs/common"

export interface DatraDeliveryConfig {
    endpointUrl: string
    apiToken: string
}

export interface DatraDeliveryEvent {
    providerKey: string
    eventName: string
    eventId: string
    idempotencyKey: string
    payload: Record<string, unknown>
}

@Injectable()
export class DatraCdpAdapter {
    private readonly logger = new Logger(DatraCdpAdapter.name)

    async deliver(config: DatraDeliveryConfig, event: DatraDeliveryEvent) {
        const response = await fetch(config.endpointUrl, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                authorization: `Bearer ${config.apiToken}`,
                "x-idempotency-key": event.idempotencyKey
            },
            body: JSON.stringify({
                providerKey: event.providerKey,
                eventName: event.eventName,
                eventId: event.eventId,
                idempotencyKey: event.idempotencyKey,
                payload: event.payload
            })
        })

        if (!response.ok) {
            const responseText = await this.safeResponseText(response)
            throw new Error(`Datra CDP request failed with ${response.status}: ${responseText}`.slice(0, 1000))
        }
    }

    private async safeResponseText(response: Response) {
        try {
            return (await response.text()).slice(0, 500)
        } catch (error) {
            this.logger.warn(`Failed to read Datra CDP error response: ${(error as Error).message}`)
            return "<unreadable response>"
        }
    }
}

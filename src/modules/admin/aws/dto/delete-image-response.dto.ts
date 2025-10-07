import {ApiProperty} from "@nestjs/swagger"

export class DeleteImageResponse {
    @ApiProperty({example: 200})
    statusCode: number

    @ApiProperty({example: "Success"})
    code: string
}

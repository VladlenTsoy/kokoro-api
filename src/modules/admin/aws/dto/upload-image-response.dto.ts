import {ApiProperty} from "@nestjs/swagger"

export class UploadImageResponse {
    @ApiProperty({example: 142, description: "Размер изображения в килобайтах"})
    size: number

    @ApiProperty({example: "tmp/1738951298712-123456789.webp", description: "Ключ файла в S3"})
    key: string

    @ApiProperty({example: "1738951298712-123456789.webp", description: "Имя файла"})
    name: string

    @ApiProperty({
        example: "https://s3.your-endpoint/tmp/1738951298712-123456789.webp",
        description: "Публичная ссылка на файл"
    })
    location: string
}

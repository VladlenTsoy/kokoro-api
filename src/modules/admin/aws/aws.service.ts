import {Injectable} from "@nestjs/common"
import {ConfigService} from "@nestjs/config"
import {CopyObjectCommand, DeleteObjectCommand, GetObjectCommand, S3Client} from "@aws-sdk/client-s3"
import {Upload} from "@aws-sdk/lib-storage"
import * as sharp from "sharp"
import {Readable} from "stream"

@Injectable()
export class AwsService {
    private s3: S3Client

    constructor(private configService: ConfigService) {
        this.s3 = new S3Client({
            endpoint: configService.get<string>("AWS_ENDPOINT"),
            region: configService.get<string>("AWS_REGION"),
            credentials: {
                accessKeyId: configService.get<string>("AWS_ACCESS_KEY_ID"),
                secretAccessKey: configService.get<string>("AWS_SECRET_ACCESS_KEY")
            },
            forcePathStyle: true // важно, если используешь S3-совместимые хранилища типа MinIO
        })
    }

    /**
     * Загрузка файла
     * @param file
     * @param filePath
     * @param quality
     * @param width
     */
    async uploadFile(
        file: Express.Multer.File,
        {
            filePath,
            quality = 100,
            width = null
        }: {
            filePath: string
            quality?: number
            width?: number
        }
    ): Promise<{Key: string; name: string; Location: string}> {
        const ext = "webp"
        const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`
        const key = `${this.configService.get("AWS_ROOT_PATH")}/${filePath}/${filename}`

        const imageBuffer = await sharp(file.buffer).webp({quality}).resize(width).toBuffer()
        const stream = Readable.from(imageBuffer)

        const upload = new Upload({
            client: this.s3,
            params: {
                Bucket: this.configService.get<string>("AWS_BUCKET_NAME"),
                Key: key,
                Body: stream,
                ACL: "public-read",
                ContentType: "image/webp"
            }
        })

        const result = await upload.done()
        return {
            Key: result.Key!,
            name: filename,
            Location: result.Location!
        }
    }

    /**
     * Получения файла
     * @param key
     */
    async getFile(key: string) {
        const command = new GetObjectCommand({
            Bucket: this.configService.get<string>("AWS_BUCKET_NAME"),
            Key: key
        })
        return this.s3.send(command)
    }

    /**
     * Переместить файл
     * @param keyFrom
     * @param keyTo
     */
    async moveFile(keyFrom: string, keyTo: string) {
        const bucket = this.configService.get<string>("AWS_BUCKET_NAME")

        try {
            const copyCommand = new CopyObjectCommand({
                Bucket: bucket,
                CopySource: `${bucket}/${keyFrom}`,
                Key: keyTo,
                MetadataDirective: "COPY",
                ACL: "public-read"
            })
            await this.s3.send(copyCommand)

            const deleteCommand = new DeleteObjectCommand({
                Bucket: bucket,
                Key: keyFrom
            })
            await this.s3.send(deleteCommand)
        } catch (e) {
            if (e.name === "NoSuchKey") {
                console.error({code: e.name, keyFrom, keyTo})
            } else {
                console.error(e)
            }
        }
    }

    /**
     * Удаление файла
     * @param key
     */
    async deleteFile(key: string) {
        const command = new DeleteObjectCommand({
            Bucket: this.configService.get<string>("AWS_BUCKET_NAME"),
            Key: key
        })
        return this.s3.send(command)
    }
}

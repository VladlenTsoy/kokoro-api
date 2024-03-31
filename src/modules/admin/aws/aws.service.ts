import {Injectable} from "@nestjs/common"
import * as AWS from "aws-sdk"
import {ConfigService} from "@nestjs/config"
import * as sharp from "sharp"
import {ManagedUpload} from "aws-sdk/lib/s3/managed_upload"
import SendData = ManagedUpload.SendData

@Injectable()
export class AwsService {
    private aws: AWS.S3

    constructor(private configService: ConfigService) {
        this.aws = new AWS.S3({
            endpoint: configService.get("AWS_ENDPOINT"),
            credentials: new AWS.Credentials(
                configService.get("AWS_ACCESS_KEY_ID"),
                configService.get("AWS_SECRET_ACCESS_KEY")
            )
        })
    }

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
    ): Promise<SendData & {name?: string}> {
        const imageBuffer = await sharp(file.buffer).webp({quality}).resize(width).toBuffer()
        const ext = "webp"
        const filename = Date.now() + "-" + Math.round(Math.random() * 1e9)
        // Params for bucket
        const params = {
            Bucket: this.configService.get("AWS_BUCKET_NANE"),
            Key: `${this.configService.get("AWS_ROOT_PATH")}/${filePath}/${filename}.${ext}`,
            Body: imageBuffer,
            ACL: "public-read"
        }

        const uploaded = await this.aws.upload(params).promise()
        return {...uploaded, name: `${filename}.${ext}`}
    }

    async getFile(key: string) {
        return this.aws
            .getObject({
                Bucket: this.configService.get("AWS_BUCKET_NANE"),
                Key: key
            }).promise()
    }

    // TODO check and update
    async moveFile(keyFrom: string, keyTo: string) {
        // Copy file
        try {
            const copyResult = await this.aws
                .copyObject({
                    Bucket: this.configService.get("AWS_BUCKET_NANE"),
                    CopySource: this.configService.get("AWS_BUCKET_NANE") + "/" + keyFrom,
                    Key: keyTo
                })
                .promise()

            if (copyResult.CopyObjectResult) {
                // Delete file
                await this.aws.deleteObject({
                    Bucket: this.configService.get("AWS_BUCKET_NANE"),
                    Key: keyFrom
                }).promise()
            }
        } catch (e) {
            if (e.code === "NoSuchKey") console.log({code: e.code, keyFrom, keyTo})
            console.log(e)
        }
    }

    async deleteFile(key: string) {
        return this.aws
            .deleteObject({
                Bucket: this.configService.get("AWS_BUCKET_NANE"),
                Key: key
            }).promise()
    }
}

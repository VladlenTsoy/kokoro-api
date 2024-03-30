import {Injectable, InternalServerErrorException, NotFoundException} from "@nestjs/common"
import * as AWS from "aws-sdk"
import {ConfigService} from "@nestjs/config"
import * as sharp from "sharp"

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
    ) {
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

        return this.aws.upload(params).promise()
    }

    async moveFile(keyFrom: string, keyTo: string) {
        // Copy file
        await this.aws
            .copyObject({
                Bucket: this.configService.get("AWS_BUCKET_NANE"),
                CopySource: this.configService.get("AWS_BUCKET_NANE") + "/" + keyFrom,
                Key: keyTo
            })
            .promise()
        // Delete file
        this.aws.deleteObject({
            Bucket: this.configService.get("AWS_BUCKET_NANE"),
            Key: keyFrom
        })
    }

    async deleteFile(key: string) {
        const params = {
            Bucket: this.configService.get("AWS_BUCKET_NANE"),
            Key: key
        }

        // Check image
        try {
            await this.aws.headObject(params).promise()
        } catch (e) {
            if (e?.code === "NotFound") throw new NotFoundException("Image not found")
            throw new InternalServerErrorException("Error loading image")
        }

        // Delete image
        try {
            await this.aws.deleteObject(params).promise()
            return {statusCode: 200, code: "Success"}
        } catch (e) {
            throw new InternalServerErrorException("Error loading image")
        }
    }
}

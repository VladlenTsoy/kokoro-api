import {
    Body,
    Controller,
    InternalServerErrorException,
    NotFoundException,
    Post,
    UploadedFile,
    UseInterceptors,
    UsePipes,
    ValidationPipe
} from "@nestjs/common"
import {AwsService} from "./aws.service"
import {FileInterceptor} from "@nestjs/platform-express"
import {DeleteImageDto} from "./dto/delete-image.dto"
import {ApiBearerAuth, ApiBody, ApiOperation, ApiTags} from "@nestjs/swagger"

@ApiBearerAuth()
@ApiTags("Images")
@Controller("admin/image")
export class AwsController {
    constructor(private readonly awsService: AwsService) {}

    @Post("upload")
    @ApiOperation({summary: "Upload image"})
    @UseInterceptors(FileInterceptor("file"))
    async create(@UploadedFile() file: Express.Multer.File) {
        const uploadedImage = await this.awsService.uploadFile(file, {
            filePath: "tmp",
            width: 2000,
            quality: 90
        })

        const image = await this.awsService.getFile(uploadedImage.Key)
        const sizeKilobytes = image.ContentLength ? Math.ceil(image.ContentLength / 1000) : 0

        return {size: sizeKilobytes, key: uploadedImage.Key, name: uploadedImage.name}
    }

    @Post("delete")
    @ApiOperation({summary: "Delete image"})
    @ApiBody({type: DeleteImageDto})
    @UsePipes(new ValidationPipe({transform: true}))
    async delete(@Body() deleteImageDto: DeleteImageDto) {
        // Check image
        try {
            await this.awsService.getFile(deleteImageDto.path)
        } catch (e) {
            if (e?.code === "NotFound") throw new NotFoundException("Image not found")
            throw new InternalServerErrorException("Error loading image")
        }

        // Delete image
        try {
            await this.awsService.deleteFile(deleteImageDto.path)
        } catch (e) {
            throw new InternalServerErrorException("Error loading image")
        }

        return {statusCode: 200, code: "Success"}
    }
}

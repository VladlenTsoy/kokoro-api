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
import {ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger"
import {UploadImageResponse} from "./dto/upload-image-response.dto"
import {DeleteImageResponse} from "./dto/delete-image-response.dto"

@ApiBearerAuth()
@ApiTags("Images")
@Controller("admin/image")
export class AwsController {
    constructor(private readonly awsService: AwsService) {}

    @Post("upload")
    @ApiOperation({summary: "Upload image"})
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        description: "Upload image file",
        schema: {
            type: "object",
            properties: {
                file: {
                    type: "string",
                    format: "binary"
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: "Successfully uploaded image",
        type: UploadImageResponse
    })
    @UseInterceptors(FileInterceptor("file"))
    async create(@UploadedFile() file: Express.Multer.File) {
        const uploadedImage = await this.awsService.uploadFile(file, {
            filePath: "tmp",
            width: 2000,
            quality: 90
        })

        const image = await this.awsService.getFile(uploadedImage.Key)
        const sizeKilobytes = image.ContentLength ? Math.ceil(image.ContentLength / 1000) : 0

        return {size: sizeKilobytes, key: uploadedImage.Key, name: uploadedImage.name, location: uploadedImage.Location}
    }

    @Post("delete")
    @ApiOperation({summary: "Delete image"})
    @ApiBody({type: DeleteImageDto})
    @ApiResponse({
        status: 200,
        description: "Image successfully deleted",
        type: DeleteImageResponse
    })
    @ApiResponse({
        status: 404,
        description: "Image not found"
    })
    @ApiResponse({
        status: 500,
        description: "Error deleting image"
    })
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
        } catch {
            throw new InternalServerErrorException("Error loading image")
        }

        return {statusCode: 200, code: "Success"}
    }
}

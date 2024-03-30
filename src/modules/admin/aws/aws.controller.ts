import {Body, Controller, Post, UploadedFile, UseInterceptors, UsePipes, ValidationPipe} from "@nestjs/common"
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
    @UseInterceptors(FileInterceptor("file")) // 'file' соответствует имени поля в форме загрузки
    create(@UploadedFile() file: Express.Multer.File) {
        return this.awsService.uploadFile(file, {
            filePath: "tmp",
            width: 2000,
            quality: 90
        })
    }

    @Post("delete")
    @ApiOperation({summary: "Delete image"})
    @ApiBody({type: DeleteImageDto})
    @UsePipes(new ValidationPipe({transform: true}))
    delete(@Body() deleteImageDto: DeleteImageDto) {
        return this.awsService.deleteFile(deleteImageDto.path)
    }
}

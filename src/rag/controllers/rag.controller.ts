import {
  Controller,
  Post,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { ApiConsumes, ApiTags, ApiBody } from "@nestjs/swagger";
import { FileInterceptor } from '@nestjs/platform-express';
import { VectorRetriever } from '../retriever/vector-retriever';
import { v4 as uuidv4 } from 'uuid';
import { FileDto } from "../dto/file.dto";
import { ApiKeyGuard } from '../../common/guards/api-key.guard';

@ApiTags('rag')
@Controller('rag')
@UseGuards(ApiKeyGuard)
export class RagController {
  constructor(
    private readonly vectorRetriever: VectorRetriever
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload a file for RAG processing',
    type: FileDto,
  })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
        const documentId = uuidv4();
        await this.vectorRetriever.storeDocument(
        documentId,
        file.buffer.toString(),
        {
          filename: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          uploadDate: new Date(),
        },
      );
      
      return {
        message: 'File uploaded and processed successfully',
        documentId,
      };
    } catch (error) {
      console.error('Error processing file:', error);
      throw new BadRequestException('Failed to process file');
    }
  }

} 
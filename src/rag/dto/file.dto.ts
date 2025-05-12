import { ApiProperty } from '@nestjs/swagger';

export class FileDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Text file to be processed for RAG (Retrieval Augmented Generation)',
  })
  file: any;
}

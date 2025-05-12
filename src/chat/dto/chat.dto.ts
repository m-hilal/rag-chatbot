import { IsString, IsOptional, IsBoolean, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChatMessageDto {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export class ChatHistoryDto {
  messages: ChatMessageDto[];
}

export class ChatResponseDto {
  response: string;
  relevantDocuments: Array<{
    content: string;
    similarity: number;
  }>;
}

export class CreateSessionDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;
}

export class UpdateSessionDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isFavorite?: boolean;
}

export class CreateMessageDto {
  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty({ enum: ['user', 'assistant'] })
  @IsEnum(['user', 'assistant'])
  role: 'user' | 'assistant';

  @ApiProperty()
  @IsUUID()
  sessionId: string;
}

export class ChatMessageResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  content: string;

  @ApiProperty({ enum: ['user', 'assistant'] })
  role: 'user' | 'assistant';

  @ApiProperty()
  createdAt: Date;
}

export class ChatSessionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  isFavorite: boolean;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ type: [ChatMessageResponseDto] })
  messages: ChatMessageResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
} 
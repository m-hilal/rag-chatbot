import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpStatus,
  Put,
  Delete,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { ChatService } from '../services/chat.service';
import {
  CreateSessionDto,
  UpdateSessionDto,
  CreateMessageDto,
  ChatSessionResponseDto,
  ChatMessageResponseDto,
} from '../dto/chat.dto';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';

@ApiTags('chat')
@Controller('chat')
@UseGuards(ApiKeyGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('sessions')
  @ApiOperation({ summary: 'Create a new chat session' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The chat session has been successfully created.',
    type: ChatSessionResponseDto,
  })
  async createSession(
    @Body() createSessionDto: CreateSessionDto,
  ): Promise<ChatSessionResponseDto> {
    if (!createSessionDto.title?.trim()) {
      throw new BadRequestException('Session name cannot be empty');
    }
    return this.chatService.createSession(createSessionDto);
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Get all active chat sessions' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all active chat sessions.',
    type: [ChatSessionResponseDto],
  })
  async getAllSessions(): Promise<ChatSessionResponseDto[]> {
    return this.chatService.getAllActiveSessions();
  }

  @Get('sessions/favorites')
  @ApiOperation({ summary: 'Get all favorite chat sessions' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all favorite chat sessions.',
    type: [ChatSessionResponseDto],
  })
  async getFavoriteSessions(): Promise<ChatSessionResponseDto[]> {
    return this.chatService.getFavoriteSessions();
  }

  @Get('sessions/:id')
  @ApiOperation({ summary: 'Get a specific chat session' })
  @ApiParam({ name: 'id', description: 'Chat session ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the specified chat session.',
    type: ChatSessionResponseDto,
  })
  async getSession(@Param('id') id: string): Promise<ChatSessionResponseDto> {
    return this.chatService.getSession(id);
  }

  @Put('sessions/:id')
  @ApiOperation({ summary: 'Update a chat session' })
  @ApiParam({ name: 'id', description: 'Chat session ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The chat session has been successfully updated.',
    type: ChatSessionResponseDto,
  })
  async updateSession(
    @Param('id') id: string,
    @Body() updateSessionDto: UpdateSessionDto,
  ): Promise<ChatSessionResponseDto> {
    return this.chatService.updateSession(id, updateSessionDto);
  }

  @Delete('sessions/:id')
  @ApiOperation({ summary: 'Delete a chat session' })
  @ApiParam({ name: 'id', description: 'Chat session ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The chat session has been successfully deleted.',
  })
  async deleteSession(@Param('id') id: string): Promise<void> {
    await this.chatService.deleteSession(id);
  }

  @Post('messages')
  @ApiOperation({ summary: 'Add a new message to a chat session' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The message has been successfully added.',
    type: ChatMessageResponseDto,
  })
  async addMessage(
    @Body() createMessageDto: CreateMessageDto,
  ): Promise<ChatMessageResponseDto> {
    return this.chatService.addMessage(createMessageDto);
  }

  @Get('sessions/:id/messages')
  @ApiOperation({ summary: 'Get all messages in a chat session' })
  @ApiParam({ name: 'id', description: 'Chat session ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all messages in the specified chat session.',
    type: [ChatMessageResponseDto],
  })
  async getMessages(@Param('id') id: string): Promise<ChatMessageResponseDto[]> {
    return this.chatService.getMessages(id);
  }
} 
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatSession } from '../entities/chat.entity';
import { ChatMessage } from '../entities/chat-message.entity';
import { CreateSessionDto, UpdateSessionDto, CreateMessageDto } from '../dto/chat.dto';
import { VectorRetriever } from '../../rag/retriever/vector-retriever';
import { LLMGenerator } from '../../rag/generator/llm-generator';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatSession)
    private chatSessionRepository: Repository<ChatSession>,
    @InjectRepository(ChatMessage)
    private chatMessageRepository: Repository<ChatMessage>,
    private readonly vectorRetriever: VectorRetriever,
    private readonly llmGenerator: LLMGenerator,
  ) {}

  async createSession(createSessionDto: CreateSessionDto): Promise<ChatSession> {
    try {
      const session = this.chatSessionRepository.create({
        ...createSessionDto,
        isActive: true,
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return await this.chatSessionRepository.save(session);
    } catch (error) {
      throw new BadRequestException('Failed to create chat session');
    }
  }

  async getSession(id: string): Promise<ChatSession> {
    try {
      const session = await this.chatSessionRepository.findOne({
        where: { id, isActive: true },
        relations: ['messages'],
        order: {
          messages: {
            createdAt: 'ASC',
          },
        },
      });

      if (!session) {
        throw new NotFoundException(`Chat session with ID ${id} not found`);
      }

      return session;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve chat session');
    }
  }

  async updateSession(id: string, updateSessionDto: UpdateSessionDto): Promise<ChatSession> {
    try {
      const session = await this.getSession(id);
      
      // Only allow updating specific fields
      const allowedUpdates = ['title', 'isFavorite'];
      const updates = Object.keys(updateSessionDto)
        .filter(key => allowedUpdates.includes(key))
        .reduce((obj, key) => {
          obj[key] = updateSessionDto[key];
          return obj;
        }, {});

      Object.assign(session, {
        ...updates,
        updatedAt: new Date(),
      });

      return await this.chatSessionRepository.save(session);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update chat session');
    }
  }

  async deleteSession(id: string): Promise<void> {
    try {
      const session = await this.getSession(id);
      session.isActive = false;
      session.updatedAt = new Date();
      await this.chatSessionRepository.save(session);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete chat session');
    }
  }

  async addMessage(createMessageDto: CreateMessageDto): Promise<ChatMessage> {
    try {
      const session = await this.getSession(createMessageDto.sessionId);
      
      // Validate message role
      if (!['user', 'assistant'].includes(createMessageDto.role)) {
        throw new BadRequestException('Invalid message role');
      }

      // Store user message
      const userMessage = this.chatMessageRepository.create({
        ...createMessageDto,
        session,
        createdAt: new Date(),
      });
      await this.chatMessageRepository.save(userMessage);

      // If it's a user message, generate and store assistant response
      if (createMessageDto.role === 'user') {
        try {
        
          // Generate response using LLM with context
          const generationResult = await this.llmGenerator.generateResponse(
            createMessageDto.content
          );

          // Store assistant response
          const assistantMessage = this.chatMessageRepository.create({
            content: generationResult.response,
            role: 'assistant',
            session,
            sessionId: session.id,
            createdAt: new Date(),
            retrievedContextJson: JSON.stringify(generationResult.context),
          });

          this.chatMessageRepository.save(assistantMessage);

          return assistantMessage;

        } catch (error) {
          // Log the error but don't fail the request
          console.error('Failed to generate assistant response:', error);
        }
      }

      return userMessage;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to add message');
    }
  }

  async getMessages(sessionId: string): Promise<ChatMessage[]> {
    try {
      const session = await this.getSession(sessionId);
      return session.messages;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve messages');
    }
  }

  async getFavoriteSessions(): Promise<ChatSession[]> {
    try {
      return await this.chatSessionRepository.find({
        where: { isFavorite: true, isActive: true },
        relations: ['messages'],
        order: {
          updatedAt: 'DESC',
          messages: {
            createdAt: 'ASC',
          },
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to retrieve favorite sessions');
    }
  }

  async getAllActiveSessions(): Promise<ChatSession[]> {
    try {
      return await this.chatSessionRepository.find({
        where: { isActive: true },
        relations: ['messages'],
        order: {
          updatedAt: 'DESC',
          messages: {
            createdAt: 'ASC',
          },
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to retrieve active sessions');
    }
  }
} 
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatService } from '../src/chat/services/chat.service';
import { ChatSession } from '../src/chat/entities/chat.entity';
import { ChatMessage } from '../src/chat/entities/chat-message.entity';
import { VectorRetriever } from '../src/rag/retriever/vector-retriever';
import { LLMGenerator } from '../src/rag/generator/llm-generator';
import { CreateSessionDto } from '../src/chat/dto/chat.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

// Mock TypeORM repository methods
const mockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
});

// Mock external services
const mockVectorRetriever = () => ({
  // Add mock methods if needed later
});

const mockLLMGenerator = () => ({
  generateResponse: jest.fn(),
});

describe('ChatService', () => {
  let service: ChatService;
  let sessionRepository: Repository<ChatSession>;
  let messageRepository: Repository<ChatMessage>;
  let llmGenerator: LLMGenerator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: getRepositoryToken(ChatSession),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(ChatMessage),
          useFactory: mockRepository,
        },
        {
          provide: VectorRetriever,
          useFactory: mockVectorRetriever,
        },
        {
          provide: LLMGenerator,
          useFactory: mockLLMGenerator,
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    sessionRepository = module.get<Repository<ChatSession>>(getRepositoryToken(ChatSession));
    messageRepository = module.get<Repository<ChatMessage>>(getRepositoryToken(ChatMessage));
    llmGenerator = module.get<LLMGenerator>(LLMGenerator);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSession', () => {
    it('should successfully create a session', async () => {
      const createSessionDto: CreateSessionDto = { title: 'Test Session' };
      const expectedSession = { id: 'uuid1', ...createSessionDto, isActive: true, isFavorite: false, createdAt: new Date(), updatedAt: new Date(), messages: [] };

      (sessionRepository.create as jest.Mock).mockReturnValue(expectedSession);
      (sessionRepository.save as jest.Mock).mockResolvedValue(expectedSession);

      const result = await service.createSession(createSessionDto);
      expect(result).toEqual(expectedSession);
      expect(sessionRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        ...createSessionDto,
        isActive: true,
        isFavorite: false,
      }));
      expect(sessionRepository.save).toHaveBeenCalledWith(expectedSession);
    });

    it('should throw BadRequestException on save failure', async () => {
      const createSessionDto: CreateSessionDto = { title: 'Test Session' };
       const mockError = new Error('DB error');
      (sessionRepository.create as jest.Mock).mockReturnValue({ ...createSessionDto });
      (sessionRepository.save as jest.Mock).mockRejectedValue(mockError);

      await expect(service.createSession(createSessionDto)).rejects.toThrow(
        new BadRequestException('Failed to create chat session')
      );
    });
  });

  describe('getSession', () => {
    it('should return a session if found', async () => {
      const sessionId = 'uuid1';
      const expectedSession = { id: sessionId, title: 'Test', isActive: true, messages: [], createdAt: new Date(), updatedAt: new Date(), isFavorite: false };

      (sessionRepository.findOne as jest.Mock).mockResolvedValue(expectedSession);

      const result = await service.getSession(sessionId);
      expect(result).toEqual(expectedSession);
      expect(sessionRepository.findOne).toHaveBeenCalledWith({
        where: { id: sessionId, isActive: true },
        relations: ['messages'],
         order: {
          messages: {
            createdAt: 'ASC',
          },
        },
      });
    });

    it('should throw NotFoundException if session not found', async () => {
      const sessionId = 'uuid-nonexistent';
      (sessionRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.getSession(sessionId)).rejects.toThrow(
        new NotFoundException(`Chat session with ID ${sessionId} not found`)
      );
    });
     it('should throw BadRequestException on findOne failure', async () => {
      const sessionId = 'uuid1';
      const mockError = new Error('DB error');
      (sessionRepository.findOne as jest.Mock).mockRejectedValue(mockError);

      await expect(service.getSession(sessionId)).rejects.toThrow(
        new BadRequestException('Failed to retrieve chat session')
      );
    });
  });

  // Add tests for other methods: updateSession, deleteSession, addMessage, getMessages, getFavoriteSessions, getAllActiveSessions
}); 
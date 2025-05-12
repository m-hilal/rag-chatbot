import { Module } from '@nestjs/common';
import { QueryProcessor } from './query/query-processor';
import { VectorRetriever } from './retriever/vector-retriever';
import { LLMGenerator } from './generator/llm-generator';
import { DocumentStorage } from './storage/document-storage';
import { OpenAIConfig } from './config/openai.config';
import { QdrantConfig } from './config/qdrant.config';
import { QdrantService } from './storage/qdrant.service';
import { RagController } from './controllers/rag.controller';

@Module({
  controllers: [RagController],
  providers: [
    QueryProcessor,
    VectorRetriever,
    LLMGenerator,
    DocumentStorage,
    OpenAIConfig,
    QdrantConfig,
    QdrantService
  ],
  exports: [
    QueryProcessor,
    VectorRetriever,
    LLMGenerator,
    DocumentStorage,
  ],
})
export class RagModule {} 
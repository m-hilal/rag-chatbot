import { Injectable } from '@nestjs/common';

@Injectable()
export class OpenAIConfig {
  private readonly apiKey: string;
  private readonly embeddingModel: string = process.env.EMBEDDING_MODEL || 'text-embedding-ada-002';

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
  }

  getApiKey(): string {
    return this.apiKey;
  }

  getEmbeddingModel(): string {
    return this.embeddingModel;
  }
} 
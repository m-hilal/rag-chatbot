import { Injectable } from '@nestjs/common';

@Injectable()
export class QdrantConfig {
  private readonly url: string;
  private readonly apiKey: string;
  private readonly collectionName: string = 'documents';

  constructor() {
    this.url = process.env.QDRANT_URL || 'http://localhost:6333';
    this.apiKey = process.env.QDRANT_API_KEY || '';
  }

  getUrl(): string {
    return this.url;
  }

  getApiKey(): string {
    return this.apiKey;
  }

  getCollectionName(): string {
    return this.collectionName;
  }
} 
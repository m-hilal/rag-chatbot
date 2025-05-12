import { Injectable, OnModuleInit } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';
import { QdrantConfig } from '../../rag/config/qdrant.config';

interface QdrantCollection {
  name: string;
  config: {
    params: {
      vectors: {
        size: number;
      };
    };
  };
}

@Injectable()
export class QdrantService implements OnModuleInit {
  private client: QdrantClient;
  private readonly VECTOR_SIZE = 1536;

  constructor(private readonly qdrantConfig: QdrantConfig) {
    this.client = new QdrantClient({
      url: this.qdrantConfig.getUrl(),
      apiKey: this.qdrantConfig.getApiKey(),
    });
  }

  async onModuleInit() {
    await this.initializeCollection();
  }

  private async initializeCollection() {
    const collectionName = this.qdrantConfig.getCollectionName();
    
    try {
      // Check if collection exists
      const collections = await this.client.getCollections();
      const exists = collections.collections.some(
        (collection) => collection.name === collectionName
      );

      if (!exists) {
        await this.client.createCollection(collectionName, {
          vectors: {
            size: this.VECTOR_SIZE,
            distance: 'Cosine',
          },
        });
        console.log(`Created new collection: ${collectionName}`);
      } else {
        // If collection exists, get its details
        const collectionInfo = await this.client.getCollection(collectionName);
        
        // Check if we need to recreate the collection with correct dimensions
        const currentVectorSize = collectionInfo.config?.params?.vectors?.size;
        
        if (currentVectorSize !== this.VECTOR_SIZE) {
          console.log(`Recreating collection ${collectionName} with correct vector size`);
          // Delete existing collection
          await this.client.deleteCollection(collectionName);
          // Create new collection with correct dimensions
          await this.client.createCollection(collectionName, {
            vectors: {
              size: this.VECTOR_SIZE,
              distance: 'Cosine',
            },
          });
          console.log(`Recreated collection ${collectionName} with vector size ${this.VECTOR_SIZE}`);
        } else {
          console.log(`Collection ${collectionName} already exists with correct vector size`);
        }
      }
    } catch (error) {
      console.error('Error initializing Qdrant collection:', error);
      throw error;
    }
  }

  async upsertDocument(
    id: string,
    embedding: number[],
    metadata: Record<string, any>,
    content: string
  ): Promise<void> {
    const collectionName = this.qdrantConfig.getCollectionName();

    try {

      await this.client.upsert(collectionName, {
        points: [
          {
            id,
            vector: embedding,
            payload: {
              content,
              ...metadata,
            },
          },
        ],
      });
    } catch (error) {
      console.error('Error upserting document to Qdrant:', error);
      throw error;
    }
  }

  async searchSimilar(
    embedding: number[],
    limit: number = 5
  ): Promise<Array<{ id: string; score: number; content: string; metadata: Record<string, any> }>> {
    const collectionName = this.qdrantConfig.getCollectionName();

    try {
      // Validate embedding size
      if (embedding.length !== this.VECTOR_SIZE) {
        throw new Error(`Invalid embedding size. Expected ${this.VECTOR_SIZE}, got ${embedding.length}`);
      }

      const searchResult = await this.client.search(collectionName, {
        vector: embedding,
        limit,
      });

      return searchResult.map((result) => {
        if (!result.payload) {
          throw new Error('Search result payload is missing');
        }
        return {
          id: result.id as string,
          score: result.score,
          content: result.payload.content as string,
          metadata: result.payload as Record<string, any>,
        };
      });
    } catch (error) {
      console.error('Error searching similar vectors in Qdrant:', error);
      throw error;
    }
  }

  async deleteDocument(id: string): Promise<void> {
    const collectionName = this.qdrantConfig.getCollectionName();

    try {
      await this.client.delete(collectionName, {
        points: [id],
      });
    } catch (error) {
      console.error('Error deleting document from Qdrant:', error);
      throw error;
    }
  }
} 
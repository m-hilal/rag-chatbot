import { Injectable } from '@nestjs/common';
import { QueryProcessor } from '../query/query-processor';
import { OpenAIConfig } from '../config/openai.config';
import { QdrantService } from '../storage/qdrant.service';
import { TextChunkingUtils } from '../../common/utility/text-chunking.utils';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { encoding_for_model, TiktokenModel } from "@dqbd/tiktoken";


@Injectable()
export class VectorRetriever {
  private openai: OpenAI;

  constructor(
    private readonly queryProcessor: QueryProcessor,
    private readonly openAIConfig: OpenAIConfig,
    private readonly qdrantService: QdrantService,
    private readonly textChunkingUtils: TextChunkingUtils,
  ) {
    this.openai = new OpenAI({
      apiKey: this.openAIConfig.getApiKey(),
    });
  }

  private countTokens(text: string): number {
    const encoding = encoding_for_model(this.openAIConfig.getEmbeddingModel() as TiktokenModel);
    const tokens = encoding.encode(text);
    return tokens.length;
  }

  /**
   * Retrieve relevant documents from the vector database
   * @param query User query
   * @param limit Maximum number of documents to retrieve
   * @returns Array of relevant documents with their metadata
   */
  async retrieveDocuments(query: string, limit: number = 5): Promise<Array<{
    content: string;
    metadata: Record<string, any>;
    similarity: number;
  }>> {
    // Process the query
    const processedQuery = await this.queryProcessor.processQuery(query);
    const keyTerms = await this.queryProcessor.extractKeyTerms(processedQuery);

    // Get query embedding
    const queryEmbedding = await this.textToEmbedding(processedQuery);

    // Search for similar documents in Qdrant
    const similarDocs = await this.qdrantService.searchSimilar(queryEmbedding, limit);

    return similarDocs.map(doc => ({
      content: doc.content,
      metadata: doc.metadata,
      similarity: doc.score,
    }));
  }

  /**
   * Store a document in the vector database
   * @param id Document ID
   * @param content Document content
   * @param metadata Document metadata
   */
  async storeDocument(
    id: string,
    content: string,
    metadata: Record<string, any> = {},
  ): Promise<void> {
    
    const chunks = this.textChunkingUtils.splitIntoChunks(content, {
      modelName: this.openAIConfig.getEmbeddingModel(),
      maxTokens: 1000,
      overlapTokens: 100
    });

    console.log(chunks.length, "chunks");

    // Store each chunk with its own ID and metadata
    for (let i = 0; i < chunks.length; i++) {
      const chunkId = uuidv4(); // Generate a new UUID for each chunk
      const chunkMetadata = {
        ...metadata,
        chunk_index: i,
        total_chunks: chunks.length,
        parent_id: id,
      };

      // Generate embedding for the chunk
      console.log(`Generating embedding for chunk ${i + 1}/${chunks.length}`);
     
      const estimatedTokens = this.countTokens(chunks[i]);
      
      if (estimatedTokens > 8000) { // Leave some buffer below the 8192 limit
        console.warn(`Chunk ${i + 1} is too large (${estimatedTokens} tokens). Skipping...`);
        continue;
      }

      const embedding = await this.textToEmbedding(chunks[i]);

      // Store chunk in Qdrant
      await this.qdrantService.upsertDocument(chunkId, embedding, chunkMetadata, chunks[i]);
    }
  }

  /**
   * Convert text to vector embedding using OpenAI's text-embedding-3-small model
   * @param text Input text
   * @returns Vector embedding
   */
  private async textToEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: this.openAIConfig.getEmbeddingModel(),
        input: text,
        encoding_format: 'float',
      });
      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error('Failed to generate embedding');
    }
  }
  
} 
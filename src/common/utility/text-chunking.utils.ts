import { Injectable } from '@nestjs/common';

export interface ChunkingOptions {
  maxTokens: number;
  overlapTokens: number;
  modelName?: string;
}

@Injectable()
export class TextChunkingUtils {
  private readonly DEFAULT_CHUNK_SIZE = 500;
  private readonly DEFAULT_OVERLAP = 100;

  // Common embedding model token limits
  private readonly MODEL_TOKEN_LIMITS = {
    'text-embedding-ada-002': 8191,
    'text-embedding-3-small': 8191,
    'text-embedding-3-large': 8191,
    'e5-large-v2': 512,
    'e5-base-v2': 512,
    'e5-small-v2': 512,
  };

  /**
   * Split text into chunks based on token limits and overlap
   * @param text The text to split into chunks
   * @param options Chunking configuration options
   * @returns Array of text chunks
   */
  public splitIntoChunks(text: string, options: ChunkingOptions): string[] {
    const maxTokens = this.getMaxTokens(options);
    const overlapTokens = options.overlapTokens || this.DEFAULT_OVERLAP;

    // Split text into paragraphs first
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const chunks: string[] = [];
    let currentChunk: string[] = [];
    let currentTokenCount = 0;

    for (const paragraph of paragraphs) {
      const paragraphTokens = this.estimateTokenCount(paragraph);
      
      // If a single paragraph is too large, split it into sentences
      if (paragraphTokens > maxTokens) {
        const sentences = this.splitIntoSentences(paragraph);
        for (const sentence of sentences) {
          const sentenceTokens = this.estimateTokenCount(sentence);
          
          // If adding this sentence would exceed the limit, create a new chunk
          if (currentTokenCount + sentenceTokens > maxTokens && currentChunk.length > 0) {
            const chunkText = currentChunk.join(' ');
            // Verify chunk size before adding
            if (this.estimateTokenCount(chunkText) <= maxTokens) {
              chunks.push(chunkText);
            } else {
              // If chunk is still too large, split it further
              const subChunks = this.splitLargeChunk(chunkText, maxTokens);
              chunks.push(...subChunks);
            }
            
            // Start new chunk with overlap
            const overlapSentences = this.getOverlapSentences(
              currentChunk,
              overlapTokens
            );
            currentChunk = overlapSentences;
            currentTokenCount = this.estimateTokenCount(currentChunk.join(' '));
          }

          currentChunk.push(sentence);
          currentTokenCount += sentenceTokens;
        }
      } else {
        // If adding this paragraph would exceed the limit, create a new chunk
        if (currentTokenCount + paragraphTokens > maxTokens && currentChunk.length > 0) {
          const chunkText = currentChunk.join('\n\n');
          // Verify chunk size before adding
          if (this.estimateTokenCount(chunkText) <= maxTokens) {
            chunks.push(chunkText);
          } else {
            // If chunk is still too large, split it further
            const subChunks = this.splitLargeChunk(chunkText, maxTokens);
            chunks.push(...subChunks);
          }
          
          // Start new chunk with overlap
          const overlapParagraphs = this.getOverlapParagraphs(
            currentChunk,
            overlapTokens
          );
          currentChunk = overlapParagraphs;
          currentTokenCount = this.estimateTokenCount(currentChunk.join('\n\n'));
        }

        currentChunk.push(paragraph);
        currentTokenCount += paragraphTokens;
      }
    }

    // Add the last chunk if it's not empty
    if (currentChunk.length > 0) {
      const chunkText = currentChunk.join('\n\n');
      if (this.estimateTokenCount(chunkText) <= maxTokens) {
        chunks.push(chunkText);
      } else {
        const subChunks = this.splitLargeChunk(chunkText, maxTokens);
        chunks.push(...subChunks);
      }
    }

    return chunks;
  }

  /**
   * Split text into sentences using common sentence boundaries
   */
  private splitIntoSentences(text: string): string[] {
    // Split on common sentence endings followed by space or newline
    return text
      .split(/(?<=[.!?])\s+/)
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 0);
  }

  /**
   * Get the maximum tokens based on model or default
   */
  private getMaxTokens(options: ChunkingOptions): number {
    if (options.modelName && this.MODEL_TOKEN_LIMITS[options.modelName]) {
      return this.MODEL_TOKEN_LIMITS[options.modelName];
    }
    return options.maxTokens || this.DEFAULT_CHUNK_SIZE;
  }

  /**
   * Get paragraphs for overlap from the end of the previous chunk
   */
  private getOverlapParagraphs(
    paragraphs: string[],
    overlapTokens: number
  ): string[] {
    const overlap: string[] = [];
    let tokenCount = 0;

    // Start from the end of the previous chunk
    for (let i = paragraphs.length - 1; i >= 0; i--) {
      const paragraph = paragraphs[i];
      const paragraphTokens = this.estimateTokenCount(paragraph);

      if (tokenCount + paragraphTokens > overlapTokens) {
        break;
      }

      overlap.unshift(paragraph);
      tokenCount += paragraphTokens;
    }

    return overlap;
  }

  /**
   * Get sentences for overlap from the end of the previous chunk
   */
  private getOverlapSentences(
    sentences: string[],
    overlapTokens: number
  ): string[] {
    const overlap: string[] = [];
    let tokenCount = 0;

    // Start from the end of the previous chunk
    for (let i = sentences.length - 1; i >= 0; i--) {
      const sentence = sentences[i];
      const sentenceTokens = this.estimateTokenCount(sentence);

      if (tokenCount + sentenceTokens > overlapTokens) {
        break;
      }

      overlap.unshift(sentence);
      tokenCount += sentenceTokens;
    }

    return overlap;
  }

  /**
   * Estimate token count using a more accurate approximation
   * This is still an approximation - for production, consider using a proper tokenizer
   */
  public estimateTokenCount(text: string): number {
    // More accurate token estimation:
    // - Words are split on spaces and punctuation
    // - Each word is roughly 1.3 tokens
    // - Special characters and punctuation add tokens
    const words = text.split(/[\s,.;:!?()[\]{}'"]+/).filter(w => w.length > 0);
    const specialChars = text.replace(/[a-zA-Z0-9\s]/g, '').length;
    
    return Math.ceil(words.length * 1.3 + specialChars * 0.5);
  }

  /**
   * Split a large chunk into smaller sub-chunks
   */
  private splitLargeChunk(text: string, maxTokens: number): string[] {
    const words = text.split(/\s+/);
    const chunks: string[] = [];
    let currentChunk: string[] = [];
    let currentTokenCount = 0;

    for (const word of words) {
      const wordTokens = this.estimateTokenCount(word);
      
      if (currentTokenCount + wordTokens > maxTokens && currentChunk.length > 0) {
        chunks.push(currentChunk.join(' '));
        currentChunk = [];
        currentTokenCount = 0;
      }
      
      currentChunk.push(word);
      currentTokenCount += wordTokens;
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk.join(' '));
    }

    return chunks;
  }
} 
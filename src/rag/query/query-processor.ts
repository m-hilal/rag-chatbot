import { Injectable } from '@nestjs/common';

@Injectable()
export class QueryProcessor {
  /**
   * Process and clean the input query
   * @param query Raw user query
   * @returns Processed query
   */
  async processQuery(query: string): Promise<string> {
    // Remove extra whitespace
    let processedQuery = query.trim().replace(/\s+/g, ' ');
    
    // Convert to lowercase for better matching
    processedQuery = processedQuery.toLowerCase();
    
    // Remove special characters except for basic punctuation
    processedQuery = processedQuery.replace(/[^a-z0-9\s.,?!]/g, '');
    
    return processedQuery;
  }

  /**
   * Extract key terms from the query
   * @param query Processed query
   * @returns Array of key terms
   */
  async extractKeyTerms(query: string): Promise<string[]> {
    // Simple implementation - split by spaces and remove common words
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    
    return query
      .split(' ')
      .filter(term => !commonWords.has(term) && term.length > 2);
  }
} 
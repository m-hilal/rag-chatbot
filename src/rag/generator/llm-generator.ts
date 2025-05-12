import { Injectable } from '@nestjs/common';
import { VectorRetriever } from '../retriever/vector-retriever';
import { OpenAIConfig } from '../config/openai.config';
import OpenAI from 'openai';

export interface GenerationResult {
  response: string;
  context: Array<{ content: string; metadata: Record<string, any>; similarity: number }>;
}

@Injectable()
export class LLMGenerator {

  private openai: OpenAI;

  constructor(
    private readonly vectorRetriever: VectorRetriever,
    private readonly openAIConfig: OpenAIConfig,
  ) {
    this.openai = new OpenAI({
      apiKey: this.openAIConfig.getApiKey()
    });
  }

  /**
   * Generate a response using the LLM
   * @param query User query
   * @returns Generated response and the context used
   */
  async generateResponse(query: string): Promise<GenerationResult> {
    try {
      // Retrieve relevant documents
      const relevantDocs = await this.vectorRetriever.retrieveDocuments(query);

      // Construct the prompt with retrieved context
      const prompt = this.constructPrompt(query, relevantDocs);

      // Call OpenAI API
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that provides accurate and concise responses based on the given context. If the context does not contain relevant information, please say so.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
      });

      // Process and return the response
      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response generated from OpenAI');
      }

      return { response, context: relevantDocs };
    } catch (error) {
      console.error('Error generating response:', error);
      throw new Error('Failed to generate response');
    }
  }

  /**
   * Construct the prompt for the LLM
   * @param query User query
   * @param relevantDocs Retrieved relevant documents
   * @returns Constructed prompt
   */
  private constructPrompt(
    query: string,
    relevantDocs: Array<{ content: string; metadata: Record<string, any>; similarity: number }>
  ): string {
    // Sort documents by similarity score
    const sortedDocs = [...relevantDocs].sort((a, b) => b.similarity - a.similarity);

    // Format the context from the most relevant documents
    const context = sortedDocs
      .map((doc, index) => `Document ${index + 1} (Relevance: ${(doc.similarity * 100).toFixed(1)}%):\n${doc.content}`)
      .join('\n\n');

    return `
Context information:
${context}

User query: ${query}

Please provide a response based on the context information above. If the context doesn't contain relevant information, please say so.`;
  }
} 
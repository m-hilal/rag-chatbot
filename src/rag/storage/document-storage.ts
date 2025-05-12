import { Injectable } from '@nestjs/common';

interface Document {
  id: string;
  content: string;
  metadata: Record<string, any>;
  embedding?: number[];
}

@Injectable()
export class DocumentStorage {
  private documents: Map<string, Document> = new Map();

  /**
   * Store a document with its metadata and optional embedding
   * @param document Document to store
   */
  async storeDocument(document: Document): Promise<void> {
    this.documents.set(document.id, document);
  }

  /**
   * Retrieve a document by ID
   * @param id Document ID
   * @returns Document if found, null otherwise
   */
  async getDocument(id: string): Promise<Document | null> {
    return this.documents.get(id) || null;
  }

  /**
   * Update a document's metadata
   * @param id Document ID
   * @param metadata New metadata
   */
  async updateMetadata(id: string, metadata: Record<string, any>): Promise<void> {
    const document = this.documents.get(id);
    if (document) {
      document.metadata = { ...document.metadata, ...metadata };
      this.documents.set(id, document);
    }
  }

  /**
   * Store an embedding for a document
   * @param id Document ID
   * @param embedding Vector embedding
   */
  async storeEmbedding(id: string, embedding: number[]): Promise<void> {
    const document = this.documents.get(id);
    if (document) {
      document.embedding = embedding;
      this.documents.set(id, document);
    }
  }

  /**
   * Delete a document
   * @param id Document ID
   */
  async deleteDocument(id: string): Promise<void> {
    this.documents.delete(id);
  }

  /**
   * List all documents
   * @returns Array of all documents
   */
  async listDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }
} 
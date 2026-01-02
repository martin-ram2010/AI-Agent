import fs from 'fs';
import path from 'path';
import { VectorStore, Document, SearchResult } from '../../interfaces/rag.types';
import { EmbeddingService } from '../embedding.service';

const STORAGE_PATH = path.join(__dirname, '../../../data/vector_store.json');

export class SimpleVectorStore implements VectorStore {
  private documents: Document[] = [];
  private embeddingService: EmbeddingService;

  constructor() {
    this.embeddingService = new EmbeddingService();
    this.loadStore();
  }

  private loadStore() {
    try {
      if (fs.existsSync(STORAGE_PATH)) {
        console.log(`[SimpleVectorStore] Loading index from ${STORAGE_PATH}`);
        const data = fs.readFileSync(STORAGE_PATH, 'utf-8');
        this.documents = JSON.parse(data);
        console.log(`[SimpleVectorStore] Loaded ${this.documents.length} documents.`);
      } else {
        console.log('[SimpleVectorStore] No existing index found. Starting fresh.');
        // Ensure data directory exists
        const dir = path.dirname(STORAGE_PATH);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      }
    } catch (error) {
      console.error('[SimpleVectorStore] Error loading store:', error);
    }
  }

  private saveStore() {
    try {
      console.log(`[SimpleVectorStore] Saving index to ${STORAGE_PATH}`);
      fs.writeFileSync(STORAGE_PATH, JSON.stringify(this.documents, null, 2));
    } catch (error) {
      console.error('[SimpleVectorStore] Error saving store:', error);
    }
  }

  public async addDocuments(docs: Document[]): Promise<void> {
    console.log(`[SimpleVectorStore] Adding ${docs.length} documents`);
    this.documents.push(...docs);
    this.saveStore();
  }

  public async search(query: string, k: number = 3): Promise<SearchResult[]> {
    console.log(`[SimpleVectorStore] Semantic search for: "${query}"`);
    
    try {
      const queryEmbedding = await this.embeddingService.generateEmbedding(query);
      
      const results = this.documents
        .filter(doc => doc.embedding && doc.embedding.length > 0)
        .map(doc => {
          const score = this.cosineSimilarity(queryEmbedding, doc.embedding!);
          return { ...doc, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, k);

      return results;
    } catch (error) {
      console.error('[SimpleVectorStore] Search Error:', error);
      // Fallback to keyword matching if embedding fails
      return this.keywordSearch(query, k);
    }
  }

  private keywordSearch(query: string, k: number): SearchResult[] {
    const terms = query.toLowerCase().split(' ');
    return this.documents.map(doc => {
      let score = 0;
      terms.forEach(term => {
        if (doc.content.toLowerCase().includes(term)) score += 0.1;
      });
      return { ...doc, score };
    })
    .filter(doc => doc.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

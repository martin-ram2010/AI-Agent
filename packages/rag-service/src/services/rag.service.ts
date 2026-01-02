import { SimpleVectorStore } from './stores/simple.store';
import { ProcessorService } from './processor.service';
import { EmbeddingService } from './embedding.service';
import { Document } from '../interfaces/rag.types';

export class RagService {
  private store: SimpleVectorStore;
  private processor: ProcessorService;
  private embedding: EmbeddingService;

  constructor() {
    this.store = new SimpleVectorStore();
    this.processor = new ProcessorService();
    this.embedding = new EmbeddingService();
  }

  public async search(query: string, k: number = 3) {
    return this.store.search(query, k);
  }

  /**
   * Ingests a file (PDF or Word) by parsing, chunking, and embedding.
   */
  public async ingestFile(filename: string, buffer: Buffer, metadata: Record<string, any> = {}) {
    let text = '';
    if (filename.endsWith('.pdf')) {
      text = await this.processor.parsePDF(buffer);
    } else if (filename.endsWith('.docx')) {
      text = await this.processor.parseWord(buffer);
    } else {
      text = buffer.toString('utf-8');
    }

    const chunks = this.processor.chunkText(text, { ...metadata, filename });
    console.log(`[RagService] Created ${chunks.length} chunks from ${filename}`);

    const docs: Document[] = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = await this.embedding.generateEmbedding(chunk.content);
      docs.push({
        id: `${filename}_${i}`,
        content: chunk.content,
        metadata: chunk.metadata,
        embedding
      });
    }

    await this.store.addDocuments(docs);
    return chunks.length;
  }

  /**
   * Bulk ingest raw documents (already text).
   */
  public async ingestDocuments(documents: { content: string, metadata?: any }[]) {
    const docs: Document[] = [];
    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      const embedding = await this.embedding.generateEmbedding(doc.content);
      docs.push({
        id: `doc_${Date.now()}_${i}`,
        content: doc.content,
        metadata: doc.metadata || {},
        embedding
      });
    }
    await this.store.addDocuments(docs);
  }
}

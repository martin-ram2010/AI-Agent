import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

export class EmbeddingService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || process.env.LLM_API_KEY,
    });
  }

  /**
   * Generates an embedding vector for the given text.
   */
  public async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: 'float',
    });

    return response.data[0].embedding;
  }

  /**
   * Generates embeddings for multiple texts in batch.
   */
  public async generateEmbeddings(texts: string[]): Promise<number[][]> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: texts,
      encoding_format: 'float',
    });

    return response.data.map(d => d.embedding);
  }
}

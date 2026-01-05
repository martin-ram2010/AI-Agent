const pdfModule = require('pdf-parse');
import mammoth from 'mammoth';

export interface Chunk {
  content: string;
  metadata: Record<string, any>;
}

export class ProcessorService {
  /**
   * Parses a PDF buffer into raw text.
   */
  public async parsePDF(buffer: Buffer): Promise<string> {
    // Handle potential CommonJS export mismatch
    const pdf = pdfModule.default || pdfModule;
    if (typeof pdf !== 'function') {
        throw new Error('Failed to load pdf-parse function: pdf module is not a function');
    }
    const data = await pdf(buffer);
    return data.text;
  }

  /**
   * Parses a Word (.docx) buffer into raw text.
   */
  public async parseWord(buffer: Buffer): Promise<string> {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  /**
   * Splits text into overlapping chunks for better semantic retrieval.
   * @param text Raw document text
   * @param chunkSize Max characters per chunk
   * @param overlap Characters to overlap between chunks
   */
  public chunkText(text: string, metadata: Record<string, any> = {}, chunkSize: number = 1000, overlap: number = 200): Chunk[] {
    const chunks: Chunk[] = [];
    let start = 0;

    // Clean up text (remove excessive newlines/whitespace)
    const cleanText = text.replace(/\s+/g, ' ').trim();

    while (start < cleanText.length) {
      const end = Math.min(start + chunkSize, cleanText.length);
      const content = cleanText.substring(start, end);
      
      chunks.push({
        content,
        metadata: { ...metadata, startIdx: start, endIdx: end }
      });

      start += (chunkSize - overlap);
      if (start >= cleanText.length) break;
    }

    return chunks;
  }
}

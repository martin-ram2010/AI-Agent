export interface Document {
  id: string;
  content: string;
  metadata?: Record<string, any>;
  embedding?: number[];
}

export interface SearchResult extends Document {
  score: number;
}

export interface VectorStore {
  /**
   * Adds documents to the store.
   * In a real implementation, this would chunk and embed the text first.
   */
  addDocuments(documents: Document[]): Promise<void>;

  /**
   * Searches for similar documents.
   * @param query The search query string.
   * @param k Number of results to return.
   */
  search(query: string, k: number): Promise<SearchResult[]>;
}

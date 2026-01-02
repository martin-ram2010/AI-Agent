import { Request, Response, NextFunction } from 'express';
import { RagService } from '../services/rag.service';

// Singleton for now
const ragService = new RagService();

export const search = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query, k } = req.body;
    
    if (!query) {
      res.status(400).json({ error: 'Missing query' });
      return;
    }

    const limit = k || 3;
    console.log(`[RagController] Searching for: "${query}" (limit: ${limit})`);
    const results = await ragService.search(query, limit);
    res.json(results);
  } catch (error) {
    next(error);
  }
};

export const ingest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { documents } = req.body;

    if (!documents || !Array.isArray(documents)) {
      res.status(400).json({ error: 'Missing documents array' });
      return;
    }

    console.log(`[RagController] Ingesting ${documents.length} documents...`);
    await ragService.ingestDocuments(documents);
    res.json({ message: `Ingested ${documents.length} documents` });
  } catch (error) {
    next(error);
  }
};

export const ingestFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { filename, base64, metadata } = req.body;

    if (!filename || !base64) {
      res.status(400).json({ error: 'Missing filename or base64 data' });
      return;
    }

    const buffer = Buffer.from(base64, 'base64');
    console.log(`[RagController] Ingesting file: ${filename} (${buffer.length} bytes)`);
    
    const count = await ragService.ingestFile(filename, buffer, metadata || {});
    res.json({ message: `Successfully ingested ${filename}`, chunks: count });
  } catch (error) {
    next(error);
  }
};

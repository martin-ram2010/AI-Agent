import { Request, Response, NextFunction } from 'express';
import { OrchestratorService } from '../services/orchestrator.service';
import { ChatRequest } from '../interfaces/chat.types';

const orchestrator = new OrchestratorService();

export const chat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const chatRequest: ChatRequest = req.body;
    
    // Basic validation
    if (!chatRequest.messages || !Array.isArray(chatRequest.messages)) {
       res.status(400).json({ error: 'Invalid request: messages array is required' });
       return;
    }

    const response = await orchestrator.processChat(chatRequest);
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const continueChat = async (req: Request, res: Response, next: NextFunction) => {
  // Logic for continuing a tool-loop or specific flow
  res.status(501).json({ message: 'Not implemented yet' });
};

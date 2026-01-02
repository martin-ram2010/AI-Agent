import { Message, ToolCall, ChatRequest } from '../interfaces/chat.types';
import { LLMProvider, LLMResponse } from '../interfaces/llm.types';
import { LLMFactory } from './llm/llm.factory';
import { getLLMConfig } from '../config/llm.config';

export { LLMResponse }; // Re-export for orchestrator

export class LLMGatewayService {
  private provider: LLMProvider;

  constructor() {
    const config = getLLMConfig();
    this.provider = LLMFactory.createProvider(config);
    console.log(`[LLMGateway] Initialized with provider: ${config.provider}, model: ${config.model}`);
  }
  
  public async generateCompletion(messages: Message[], tools: any[] = []): Promise<LLMResponse> {
    return this.provider.generateResponse(messages, tools);
  }
}

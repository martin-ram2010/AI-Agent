import { Message, ToolCall } from './chat.types';

export interface LLMResponse {
  content: string | null;
  toolCalls?: ToolCall[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface LLMProvider {
  /**
   * Generates a completion from the LLM.
   * @param messages The conversation history
   * @param tools Optional list of tools to expose to the model
   */
  generateResponse(messages: Message[], tools?: any[]): Promise<LLMResponse>;
}

export interface LLMConfig {
  provider: 'openai' | 'azure';
  apiKey: string;
  model: string;
  baseUrl?: string; // For Azure or custom endpoints
  apiVersion?: string; // For Azure
}

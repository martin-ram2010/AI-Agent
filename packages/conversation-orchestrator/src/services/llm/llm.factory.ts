import { LLMProvider, LLMConfig } from '../../interfaces/llm.types';
import { OpenAIProvider } from './openai.provider';

export class LLMFactory {
  public static createProvider(config: LLMConfig): LLMProvider {
    switch (config.provider) {
      case 'openai':
        return new OpenAIProvider(config);
      case 'azure':
        throw new Error('Azure provider not yet implemented');
      default:
        throw new Error(`Unsupported LLM provider: ${config.provider}`);
    }
  }
}

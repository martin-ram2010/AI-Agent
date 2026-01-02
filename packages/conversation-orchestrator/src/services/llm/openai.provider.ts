import OpenAI from 'openai';
import { LLMProvider, LLMConfig, LLMResponse } from '../../interfaces/llm.types';
import { Message } from '../../interfaces/chat.types';

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI;
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl, // Optional, for proxies
    });
  }

  public async generateResponse(messages: Message[], tools?: any[]): Promise<LLMResponse> {
    try {
      // Map internal messages to OpenAI messages
      // Note: We need to ensure the roles match (user, assistant, system, tool)
      const openAIMessages = messages.map(m => ({
        role: m.role as any, // Cast to match OpenAI types
        content: m.content,
        name: m.name,
        tool_call_id: m.tool_call_id,
        tool_calls: m.tool_calls
      }));

      const params: OpenAI.Chat.ChatCompletionCreateParams = {
        model: this.config.model,
        messages: openAIMessages,
        temperature: 0.7,
      };

      if (tools && tools.length > 0) {
        params.tools = tools;
        params.tool_choice = 'auto';
      }

      const completion = await this.client.chat.completions.create(params);
      const choice = completion.choices[0];

      return {
        content: choice.message.content,
        toolCalls: choice.message.tool_calls as any,
        usage: {
          prompt_tokens: completion.usage?.prompt_tokens || 0,
          completion_tokens: completion.usage?.completion_tokens || 0,
          total_tokens: completion.usage?.total_tokens || 0,
        },
      };

    } catch (error: any) {
      console.error('[OpenAIProvider] Error generating response:', error);
      throw new Error(`OpenAI API Error: ${error.message}`);
    }
  }
}

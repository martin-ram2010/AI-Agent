import dotenv from 'dotenv';
import { LLMConfig } from '../interfaces/llm.types';

dotenv.config();

export const getLLMConfig = (): LLMConfig => {
  const provider = (process.env.LLM_PROVIDER as 'openai' | 'azure') || 'openai';
  const apiKey = process.env.LLM_API_KEY || '';
  const model = process.env.LLM_MODEL || 'gpt-4-turbo-preview';
  const baseUrl = process.env.LLM_BASE_URL; // Optional
  const apiVersion = process.env.LLM_API_VERSION; // For Azure

  if (!apiKey) {
    console.warn('[Config] LLM_API_KEY is not set. LLM calls will fail.');
  }

  return {
    provider,
    apiKey,
    model,
    baseUrl,
    apiVersion
  };
};

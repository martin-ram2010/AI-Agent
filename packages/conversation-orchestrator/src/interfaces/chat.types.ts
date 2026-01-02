export type Role = 'user' | 'assistant' | 'system' | 'tool';

export interface Message {
  role: Role;
  content: string;
  name?: string; // For tool outputs or specific agent names
  tool_calls?: ToolCall[];
  tool_call_id?: string; // For tool messages
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string; // JSON string
  };
}

export interface AgentContext {
  userId: string;
  orgId: string;
  roles: string[]; // e.g., ['admin', 'viewer']
  sessionId?: string;
  metadata?: Record<string, any>;
}

export interface ChatRequest {
  messages: Message[];
  context?: AgentContext;
  stream?: boolean;
}

export interface ChatResponse {
  messages: Message[];
  sessionId: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

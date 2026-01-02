import { Message, AgentContext } from '../interfaces/chat.types';
import { PIIDetector } from './policy/pii.detector';

export class PolicyService {
  private piiDetector: PIIDetector;

  constructor() {
    this.piiDetector = new PIIDetector();
  }
  
  public async validateRequest(context: AgentContext): Promise<boolean> {
    // Basic RBAC: If context has roles, they are valid.
    // In strict mode, we might require specific roles like 'standard_user'
    if (!context.roles || context.roles.length === 0) {
      console.warn('[PolicyService] Request denied: No roles present in context');
      return false;
    }
    return true;
  }

  public async sanitizeInput(messages: Message[]): Promise<Message[]> {
    return messages.map(msg => ({
      ...msg,
      content: this.piiDetector.redact(msg.content)
    }));
  }

  public async deidentifyMessages(messages: Message[], vault: Map<string, string>): Promise<Message[]> {
    return messages.map(msg => {
      const sanitized: Message = {
        ...msg,
        content: this.piiDetector.tokenize(msg.content || '', vault)
      };

      if (msg.tool_calls) {
        sanitized.tool_calls = msg.tool_calls.map(tc => ({
          ...tc,
          function: {
            ...tc.function,
            arguments: this.piiDetector.tokenize(tc.function.arguments, vault)
          }
        }));
      }

      return sanitized;
    });
  }

  public async reidentifyContent(text: string, vault: Map<string, string>): Promise<string> {
    return this.piiDetector.detokenize(text, vault);
  }

  public async sanitizeOutput(text: string): Promise<string> {
    return this.piiDetector.redact(text);
  }
}

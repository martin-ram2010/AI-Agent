import { ToolCall } from '../interfaces/chat.types';

export class ToolExecutor {
  private orgServiceUrl = 'http://localhost:3001/v1/org';
  private ragServiceUrl = 'http://localhost:3002/v1/rag';

  public async executeToolCalls(toolCalls: ToolCall[]): Promise<any[]> {
    const results = [];

    for (const call of toolCalls) {
      console.log(`[ToolExecutor] Executing ${call.function.name}`);
      try {
        const result = await this.routeTool(call);
        results.push({
          tool_call_id: call.id,
          role: 'tool',
          name: call.function.name,
          content: JSON.stringify(result)
        });
      } catch (error: any) {
        console.error(`[ToolExecutor] Error executing ${call.function.name}:`, error);
        results.push({
          tool_call_id: call.id,
          role: 'tool',
          name: call.function.name,
          content: JSON.stringify({ error: error.message })
        });
      }
    }

    return results;
  }

  private async routeTool(call: ToolCall): Promise<any> {
    const args = JSON.parse(call.function.arguments);
    const name = call.function.name;

    // Org Tools
    if (name === 'org_describeEntity') {
      return this.post(`${this.orgServiceUrl}/describeEntity`, args);
    }
    if (name === 'org_queryEntities') {
      return this.post(`${this.orgServiceUrl}/queryEntities`, args);
    }
    if (name === 'org_updateEntity') {
      return this.post(`${this.orgServiceUrl}/updateEntity`, args);
    }

    // RAG Tools
    if (name === 'rag_search') {
      return this.post(`${this.ragServiceUrl}/search`, args);
    }

    throw new Error(`Unknown tool: ${name}`);
  }

  private async post(url: string, body: any): Promise<any> {
    console.log(`[ToolExecutor] POST ${url}`);
    console.log(`[ToolExecutor] Payload: ${JSON.stringify(body)}`);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    console.log(`[ToolExecutor] Received status ${response.status} from ${url}`);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Service Error (${response.status}): ${text}`);
    }

    return response.json();
  }
}

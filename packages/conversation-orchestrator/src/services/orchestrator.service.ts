import { ChatRequest, ChatResponse, Message } from '../interfaces/chat.types';
import { PolicyService } from './policy.service';
import { LLMGatewayService, LLMResponse } from './llm.service';
import { ToolExecutor } from './tool.executor';
import { AuditService } from './audit.service';

export class OrchestratorService {
  private policyService: PolicyService;
  private llmGateway: LLMGatewayService;
  private toolExecutor: ToolExecutor;
  private auditService: AuditService;
  private maxTurns = 5;
  private privacyVault: Map<string, string> = new Map(); // Shared across turns in a request

  constructor() {
    this.policyService = new PolicyService();
    this.llmGateway = new LLMGatewayService();
    this.toolExecutor = new ToolExecutor();
    this.auditService = AuditService.getInstance();
  }

  public async processChat(request: ChatRequest): Promise<ChatResponse> {
    const startTime = Date.now();
    let cumulativeUsage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

    this.auditService.log({
      type: 'REQUEST_START',
      stage: 'Initialization',
      message: `Processing chat for user: ${request.context?.userId}`,
      metadata: { 
        userId: request.context?.userId, 
        sessionId: request.context?.sessionId,
        rawInput: request.messages 
      },
      status: 'SUCCESS'
    });

    try {
      // 1. Policy Check & Input Sanitization
      console.log('[Orchestrator] Validating User Policy...' + JSON.stringify(request));
      const isPolicyValid = await this.policyService.validateRequest(request.context || { userId: 'anon', orgId: 'default', roles: [] });
      
      this.auditService.log({
        type: 'POLICY_CHECK',
        stage: 'Security',
        message: isPolicyValid ? 'User policy validated' : 'User policy validation failed',
        metadata: { context: request.context },
        status: isPolicyValid ? 'SUCCESS' : 'ERROR'
      });

      if (!isPolicyValid) {
        throw new Error('Policy validation failed');
      }

      // Clear vault for new request
      this.privacyVault.clear();

      console.log('[Orchestrator] Sanitizing Input (De-identification)...');
      let messages = await this.policyService.deidentifyMessages(request.messages, this.privacyVault);
      
      this.auditService.log({
        type: 'DEIDENTIFICATION',
        stage: 'Security',
        message: `Sanitized ${messages.length} messages. Vault size: ${this.privacyVault.size}`,
        metadata: { deidentifiedMessages: messages, vaultSize: this.privacyVault.size },
        status: 'SUCCESS'
      });

      // 1.2 Sliding Window Strategy (Server-side safety)
      const MAX_HISTORY = 15;
      if (messages.length > MAX_HISTORY) {
        console.log(`[Orchestrator] Pruning history from ${messages.length} to ${MAX_HISTORY} messages.`);
        messages = messages.slice(-MAX_HISTORY);
      }

      // Safety: ensure it doesn't start with a 'tool' message as it requires a preceding 'assistant' call
      while (messages.length > 0 && messages[0].role === 'tool') {
        messages.shift();
      }

      console.log('[Orchestrator] Sanitized Input:', JSON.stringify(messages));

      // 2. Main Loop (Multi-turn)
      let turns = 0;

      // Inject System Instruction for Persona and Formatting
      const systemPrompt: Message = {
        role: 'system',
        content: `You are a specialized Banking & CRM Assistant. 
      Your purpose is to assist with **Banking Processes** and the management of core **Customer Records**.
      
      MISSION OBJECTIVE:
      - Your primary mission is to provide information and perform actions on core Banking/CRM objects: **Account**, **Contact**, **Lead**, **Opportunity**, and **Case**.
      - You also assist with **Banking Processes**, including policies, required documents, and procedural FAQs.
      - **ALWAYS use the \`rag_search\` tool** to search for answers regarding banking documents, processes, or general policies before stating you don't know the answer.
      - If a query is NOT related to these specific objects or banking context (e.g., weather, stocks, general coding, sports), politely decline and state your focus.
      
      CRITICAL WORKFLOW & SAFETY:
      1. **Human-in-the-Loop for Updates**: You MUST ask for user confirmation before calling the \`org_updateEntity\` tool.
      2. **Search Before Refusal**: If a user asks a question about banking (e.g., "required documents for X", "how to close Y"), you MUST call \`rag_search\` first.
      3. **NEVER guess field names**. Salesforce schemas vary between orgs.
      4. Only after identifying the correct field names should you use the \`org_queryEntities\` or \`org_updateEntity\` tools.
      5. **Mandatory Data for Updates**: When calling \`org_updateEntity\`, you MUST include the \`data\` object parameter.
      
      CRITICAL TOOLS & SCOPE:
      1. Use \`rag_search\` for ALL banking process and document-related queries.
      2. Use \`org_describeEntity\`, \`org_queryEntities\`, and \`org_updateEntity\` for CRM record management.
      3. NEVER attempt to query or discuss non-banking/non-CRM topics.
      4. Keep PII tokens like [PHONE_1] as-is in your response.`
      };

      // Always enforce the latest system prompt at the top, removing any stale ones from history
      messages = messages.filter(m => m.role !== 'system');
      messages.unshift(systemPrompt);

      while (turns < this.maxTurns) {
        console.log(`[Orchestrator] Turn ${turns + 1}`);

        // Define tools definition
        const tools = [
          {
            type: 'function',
            function: {
              name: 'org_describeEntity',
              description: 'Get schema for a core Banking/History entity (Account, Contact, Lead, Opportunity, Case, and their History versions)',
              parameters: {
                type: 'object',
                properties: {
                  system: { type: 'string', enum: ['salesforce', 'servicenow'] },
                  entityName: { type: 'string', enum: ['Account', 'Contact', 'Lead', 'Opportunity', 'Case', 'AccountHistory', 'ContactHistory', 'LeadHistory', 'OpportunityHistory', 'CaseHistory'] }
                },
                required: ['system', 'entityName']
              }
            }
          },
          {
            type: 'function',
            function: {
              name: 'org_queryEntities',
              description: 'Execute a SOQL query against core Banking/History objects',
              parameters: {
                type: 'object',
                properties: {
                  system: { type: 'string', enum: ['salesforce', 'servicenow'] },
                  query: { type: 'string', description: 'SOQL query. Restricted to core Banking and History objects.' }
                },
                required: ['system', 'query']
              }
            }
          },
          {
            type: 'function',
            function: {
              name: 'org_updateEntity',
              description: 'Update a core Banking object record. REQUIRE USER CONFIRMATION BEFORE CALLING.',
              parameters: {
                type: 'object',
                properties: {
                  system: { type: 'string', enum: ['salesforce', 'servicenow'] },
                  entityName: { type: 'string' },
                  id: { type: 'string', description: 'The identifier of the record' },
                  data: { type: 'object', description: 'Key-value pairs of fields to update (e.g., {"BillingPostalCode": "67676"}). MUST NOT BE EMPTY.' }
                },
                required: ['system', 'entityName', 'id', 'data']
              }
            }
          },
          {
            type: 'function',
            function: {
              name: 'rag_search',
              description: 'Search the Banking Knowledge Base for policies, process documents, and FAQs.',
              parameters: {
                type: 'object',
                properties: {
                  query: { type: 'string', description: 'The semantic search query' },
                  k: { type: 'number', description: 'Number of results to return (default 3)' }
                },
                required: ['query']
              }
            }
          }
        ];

        // Call LLM
        this.auditService.log({
          type: 'LLM_REQUEST',
          stage: 'Thinking',
          message: `Sending turn ${turns+1} payload to LLM`,
          metadata: { messages, tools },
          status: 'SUCCESS'
        });

        console.log(`[Orchestrator] Calling LLM with ${messages.length} messages...`);
        const llmStartTime = Date.now();
        const llmResponse: LLMResponse = await this.llmGateway.generateCompletion(messages, tools);
        const llmDuration = Date.now() - llmStartTime;
        
        // Track usage
        if (llmResponse.usage) {
          cumulativeUsage.prompt_tokens += llmResponse.usage.prompt_tokens || 0;
          cumulativeUsage.completion_tokens += llmResponse.usage.completion_tokens || 0;
          cumulativeUsage.total_tokens += llmResponse.usage.total_tokens || 0;
        }

        console.log(`[Orchestrator] LLM Responded. Usage: ${JSON.stringify(llmResponse.usage)}`);

        this.auditService.log({
          type: 'LLM_RESPONSE',
          stage: 'Intelligence',
          message: `LLM response received in ${llmDuration}ms`,
          metadata: { 
            usage: llmResponse.usage, 
            content: llmResponse.content, 
            toolCalls: llmResponse.toolCalls,
            cumulativeUsage 
          },
          duration: llmDuration,
          status: 'SUCCESS'
        });

        // De-identify the LLM response itself before adding to history
        const sanitizedAssistantMessages = await this.policyService.deidentifyMessages([{
          role: 'assistant',
          content: llmResponse.content || '',
          tool_calls: llmResponse.toolCalls
        }], this.privacyVault);

        const assistantMessage = sanitizedAssistantMessages[0];
        messages.push(assistantMessage);

        // Check for Tool Calls
        if (llmResponse.toolCalls && llmResponse.toolCalls.length > 0) {
          console.log(`[Orchestrator] Detected ${llmResponse.toolCalls.length} tool calls.`);

          // IMPORTANT: Re-identify Tool Arguments before execution!
          // The LLM might have used tokens (e.g., [ID_1]) as arguments.
          const detokenizedToolCalls = await Promise.all(llmResponse.toolCalls.map(async (tc) => ({
            ...tc,
            function: {
              ...tc.function,
              arguments: await this.policyService.reidentifyContent(tc.function.arguments, this.privacyVault)
            }
          })));

          const toolStartTime = Date.now();
          const rawToolResults = await this.toolExecutor.executeToolCalls(detokenizedToolCalls);
          const toolDuration = Date.now() - toolStartTime;

          this.auditService.log({
            type: 'TOOL_RESULT',
            stage: 'Execution',
            message: `Executed ${detokenizedToolCalls.length} tools in ${toolDuration}ms`,
            metadata: { toolCalls: detokenizedToolCalls, results: rawToolResults },
            duration: toolDuration,
            status: 'SUCCESS'
          });

          // REDACTION STEP: Tokenize tool results before they hit the history for LLM
          console.log('[Orchestrator] De-identifying Tool Results for OpenAI Privacy...');
          const tokenizedResults = await this.policyService.deidentifyMessages(
            rawToolResults.map((res: any) => ({
              role: 'tool',
              content: res.content,
              tool_call_id: res.tool_call_id,
              name: res.name
            } as Message)),
            this.privacyVault
          );

          messages.push(...tokenizedResults);

          this.auditService.log({
            type: 'TOOL_RESULT',
            stage: 'Feedback Loop',
            message: `Feeding de-identified tool results back to LLM for turn ${turns+2}`,
            metadata: { feedbackMessages: tokenizedResults },
            status: 'SUCCESS'
          });

          turns++;
        } else {
          // Final response (no more tools)
          console.log('[Orchestrator] Re-identifying Final Output for User...');

          // Re-identify the final response content for the user
          const reidentifiedContent = await this.policyService.reidentifyContent(assistantMessage.content, this.privacyVault);
          assistantMessage.content = reidentifiedContent;

          // CRITICAL: We also need to re-identify ALL messages we return to the client
          // so that the client-side history remains raw data for re-tokenization on the next request.
          const reidentifiedMessages = await Promise.all(messages.map(async (msg) => {
            const reidentifiedContent = await this.policyService.reidentifyContent(msg.content || '', this.privacyVault);
            const sanitizedMsg = { ...msg, content: reidentifiedContent };

            if (msg.tool_calls) {
              sanitizedMsg.tool_calls = await Promise.all(msg.tool_calls.map(async (tc) => ({
                ...tc,
                function: {
                  ...tc.function,
                  arguments: await this.policyService.reidentifyContent(tc.function.arguments, this.privacyVault)
                }
              })));
            }
            return sanitizedMsg;
          }));

          console.log('[Orchestrator] sending final response.');

          const totalDuration = Date.now() - startTime;
          this.auditService.log({
            type: 'REQUEST_END',
            stage: 'Completion',
            message: `Request completed successfully in ${totalDuration}ms. Total Tokens: ${cumulativeUsage.total_tokens}`,
            metadata: { 
              totalTokens: cumulativeUsage,
              finalMessages: reidentifiedMessages 
            },
            duration: totalDuration,
            status: 'SUCCESS'
          });

          return {
            sessionId: request.context?.sessionId || 'new-session',
            messages: reidentifiedMessages,
            usage: cumulativeUsage
          };
        }
      }

      throw new Error('Max conversation turns exceeded');
    } catch (error: any) {
      const totalDuration = Date.now() - startTime;
      this.auditService.log({
        type: 'ERROR',
        stage: 'Orchestration',
        message: `Error in processChat: ${error.message}`,
        metadata: { stack: error.stack, cumulativeUsage },
        duration: totalDuration,
        status: 'ERROR'
      });
      throw error;
    }
  }
}


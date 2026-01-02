# Salesforce Data Flow

This flow describes how the AI Agent interacts with Salesforce to query or update CRM records.

## Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    participant User
    participant Orchestrator as Orchestrator Service
    participant Policy as Policy Service
    participant LLM as LLM (OpenAI/Azure)
    participant ToolExec as Tool Executor
    participant OrgTool as Org Tooling Service
    participant SF as Salesforce API

    User->>Orchestrator: "Show me details for account 'Acme Corp'"
    Orchestrator->>Policy: Validate & De-identify (Redact PII)
    Orchestrator->>LLM: Send context + Tool definitions
    LLM-->>Orchestrator: Recommend Tool: org_queryEntities(soql="SELECT...")
    Note over Orchestrator: Re-identify Tool Args (tokens -> Names)
    Orchestrator->>ToolExec: Execute org_queryEntities
    ToolExec->>OrgTool: POST /v1/org/queryEntities
    OrgTool->>OrgTool: Get JWT Auth Connection
    OrgTool->>SF: Execute SOQL Query
    SF-->>OrgTool: Return Record Data
    OrgTool-->>ToolExec: JSON Data
    ToolExec-->>Orchestrator: Tool results
    Orchestrator->>Policy: De-identify tool results
    Orchestrator->>LLM: Provide record data + Original query
    LLM-->>Orchestrator: Summarized record info
    Orchestrator->>Policy: Re-identify (Restore PII)
    Orchestrator-->>User: "The details for Acme Corp are..."
```

## Detailed Steps

1. **User Request**: User asks to see, find, or update a Salesforce record.
2. **LLM Tool Selection**: The LLM identifies the need for CRM interaction and constructs a SOQL query or update payload.
3. **Token Re-identification**: If the LLM produces a query using tokens (e.g., `WHERE Name = '[NAME_1]'`), the Orchestrator restores the real names before hitting the service.
4. **Secure Connection**: The `Org Tooling Service` handles JWT-based authentication to Salesforce using a private key and Connected App credentials.
5. **API Call**: The service uses `jsforce` to execute the query or update against the Salesforce REST API.
6. **Result Processing**: Data is returned to the Orchestrator.
7. **Redaction**: Any PII in the Salesforce records (e.g., phone numbers on a contact) is automatically tokenized before being sent to the LLM for summarization.
8. **User Display**: The final summarized text is re-identified and displayed to the user.

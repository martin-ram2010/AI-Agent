# Presentation Outline: Banking AI Agent & MCP Architecture

This document is structured as a slide deck. You can copy the content and images directly into PowerPoint, Google Slides, or Canva.

---

## Slide 1: Title Slide

**Visual Background**:
![Banking AI Agent Title Visual](file:///C:/Users/marti/.gemini/antigravity/brain/24307690-1931-4500-8dea-8272b93e93f5/ppt_title_slide_visual_1766969257256.png)

**Text**:

# Banking AI Agent 2.0

## Intelligent Knowledge & CRM Orchestration via MCP

**Presenter Name / Date**

---

## Slide 2: The Challenge

**Points**:

- **Knowledge Fragmentation**: Banking policies are buried in scattered PDFs and Word docs.
- **CRM Friction**: Manual Salesforce updates are slow and error-prone.
- **Data Privacy**: Sending sensitive customer data (PII) to LLMs is a major risk.

---

## Slide 3: Functional Vision

**Points**:

- **AI-Driven Knowledge retrieval**: Semantic search for instant answers.
- **Natural Language CRM**: Manage Accounts and Contacts via chat.
- **Security by Design**: Automated PII masking.

---

## Slide 4: High-Level Architecture

**Visual**:
![Technical Architecture Visualization](file:///C:/Users/marti/.gemini/antigravity/brain/24307690-1931-4500-8dea-8272b93e93f5/ai_agent_architecture_pro_1766964875623.png)

**Key Components**:

- **Agent UI**: Modern Frontend.
- **The Brain**: Conversation Orchestrator.
- **The Services**: RAG (Knowledge) & Org Tooling (Salesforce).

---

## Slide 5: Privacy Shield (PII Redaction)

**Visual**:
![Data Privacy Visual](file:///C:/Users/marti/.gemini/antigravity/brain/24307690-1931-4500-8dea-8272b93e93f5/security_pii_slide_visual_1766969268934.png)

**How it Works**:

1.  **Detect**: Policy Service scans for sensitive data.
2.  **Redact**: Data is replaced with tokens (e.g., `[PHONE_1]`).
3.  **Process**: LLM sees only sanitized text.
4.  **Restore**: Real data is restored locally for the user.

---

## Slide 6: The MCP Advantage

**Points**:

- **MCP Host**: The Orchestrator manages tools and context.
- **MCP Server**: Org Tooling Service connects securely to Salesforce.
- **Interoperability**: Standardized protocol for any enterprise data source.

---

## Slide 7: Technical Flow (The "Trip")

**Points**:

1.  User Query -> **Policy Service** (Redact).
2.  Context -> **Orchestrator** (Brain).
3.  Brain -> **Tool Executor** (Dispatch).
4.  Executor -> **RAG/Salesforce** (Fetch).
5.  Result -> **User** (Re-identify).

---

## Slide 8: Summary & Key Takeaways

**Points**:

- **Secure**: Zero PII leakage to external APIs.
- **Scalable**: Modular microservices & MCP.
- **Empowering**: Turns complex data into instant insights.

---

## Slide 9: Q&A

**Visual Asset**: Link back to [Technical Documentation](file:///c:/Ranjan/Development%20Projects/AI%20Agent%20with%20MCP/docs/README.md)

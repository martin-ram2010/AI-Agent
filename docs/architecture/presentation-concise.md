# Concise Presentation: Banking AI Agent & MCP

This version is optimized for a 3-slide executive summary.

---

## Slide 1: Transforming Banking with Secure AI

**Visual**:
![Title Slide Visual](file:///C:/Users/marti/.gemini/antigravity/brain/24307690-1931-4500-8dea-8272b93e93f5/ppt_title_slide_visual_1766969257256.png)

**Key Message**:

- **Intelligent Knowledge**: Instant semantic search across banking policies (RAG).
- **Natural Language CRM**: Seamlessly query and update Salesforce records.
- **Business Impact**: Reduced operational friction and enhanced employee productivity.

---

## Slide 2: The Architecture & MCP Standard

**Visual**:
![Architecture Visualization](file:///C:/Users/marti/.gemini/antigravity/brain/24307690-1931-4500-8dea-8272b93e93f5/ai_agent_architecture_pro_1766964875623.png)

**How it Works**:

- **MCP Host (Orchestrator)**: Manages intelligence, context, and tool dispatching.
- **MCP Servers (RAG & SF)**: Securely isolates enterprise data and document retrieval.
- **Scalability**: Standardized protocol allows adding new enterprise systems (Jira, ServiceNow) effortlessly.

---

## Slide 3: Enterprise-Grade Privacy (PII Shield)

**Visual**:
![Security Visual](file:///C:/Users/marti/.gemini/antigravity/brain/24307690-1931-4500-8dea-8272b93e93f5/security_pii_slide_visual_1766969268934.png)

**Zero-Leaking Context**:

- **Automatic Redaction**: Sensitive data (Name, SSN, Phone) is tokenized before hitting external LLMs.
- **Local Re-identification**: Real data is only restored on the secure project environment for the final user view.
- **Compliance**: Built-in guardrails for SOC2/GDPR alignment.

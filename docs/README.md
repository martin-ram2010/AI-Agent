# AI Agent Architecture Documentation

This directory contains sequence flow diagrams and architectural details for the AI Agent with MCP.

## Sequence Flows & Design

- [Functional Architecture Design](architecture/functional-design.md) - System purpose and user journeys.
- [Technical Architecture Design](architecture/technical-design.md) - Tech stack and microservices.
- [RAG Knowledge Search](architecture/rag-flow.md) - How the agent searches the banking knowledge base.
- [Presentation Deck](architecture/presentation.md) - Full 9-slide presentation guide.
- [Concise Presentation](architecture/presentation-concise.md) - 3-slide executive summary.
- [Salesforce Data Integration](architecture/salesforce-flow.md) - How the agent queries and updates Salesforce records.
- [AWS Deployment Guide](deploy-aws.md) - Step-by-step instructions for AWS Free Tier.

## Component Overview

- **Agent UI**: The frontend interface for user interaction.
- **Conversation Orchestrator**: The central brain that manages multi-turn logic, PII redaction, and tool dispatching.
- **RAG Service**: Handles semantic search and document ingestion.
- **Org Tooling Service**: MCP service for interacting with Salesforce and other CRM systems.

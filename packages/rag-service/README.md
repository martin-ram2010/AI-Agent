# Banking RAG Service - User Instructions

This service allows the AI Agent to search through your banking policies, process documents, and FAQs using semantic search.

## 1. Supported Document Types

- **PDF** (`.pdf`)
- **Word** (`.docx`)
- **Text** (`.txt`)

## 2. How to Add New Documents

1. Navigate to the `knowledge_base` folder:
   `packages/rag-service/knowledge_base/`
2. Drop your new documents into this folder.
3. (Optional) Remove old documents if they are no longer relevant.

## 3. How to Run Ingestion

Whenever you add or update files in the `knowledge_base` folder, you must run the ingestion script to update the "memory" of the agent.

Open your terminal and run:

```powershell
# 1. Navigate to the rag-service directory
cd "packages/rag-service"

# 2. Run the ingestion script
npx ts-node scripts/ingest-files.ts
```

## 4. How Persistence Works

- The script parses your documents and creates mathematical "embeddings" (vectors).
- These vectors are saved to `packages/rag-service/data/vector_store.json`.
- The `rag-service` automatically loads this file whenever it starts.
- **You do NOT need to re-run ingestion if you just restart the service.** Only run it if you change the files in `knowledge_base`.

## 5. Troubleshooting

- **Missing API Key**: Ensure your OpenAI API key is in `packages/rag-service/.env`.
- **Port Conflict**: The service runs on port `3002`. Ensure no other service is using this port.
- **Unsupported Files**: If a file fails to upload, check the terminal output for specific error messages.

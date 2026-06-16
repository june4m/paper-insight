# Paper Insight – Backend

Node.js + Express API for the AI Document Q&A Chatbot (RAG). Implements WBS
phases 2.0 (Backend) and 4.0 (RAG Pipeline).

## Setup

```bash
cd backend
npm install
cp .env.example .env      # then edit .env
```

Set at minimum `GEMINI_API_KEY` (https://aistudio.google.com/app/apikey).

### Vector store

- `VECTOR_BACKEND=chroma` (default): requires a running ChromaDB server.
  Start one with Docker: `docker run -p 8000:8000 chromadb/chroma`
  (or `pip install chromadb && chroma run --path ./chroma`).
  If the server is unreachable, the app automatically falls back to the
  in-memory store and logs a warning.
- `VECTOR_BACKEND=memory`: pure JS cosine store persisted in SQLite. No external
  server needed — ideal for local dev/demo.

## Run

```bash
npm run dev     # nodemon, http://localhost:4000
npm start       # production
```

## Endpoints (base `/api`)

| Method | Path | Purpose |
|---|---|---|
| GET | /health | liveness |
| POST | /documents/upload | upload PDF (multipart `file`) |
| GET | /documents | list documents |
| GET | /documents/:id | document detail |
| DELETE | /documents/:id | delete doc + chunks + vectors + chat |
| POST | /documents/:id/summary | generate summary |
| POST | /chat/ask | `{ document_id, question }` → `{ answer, sources }` |
| GET | /chat/:documentId/history | chat history |

Full contract: [../docs/04-api-contract.md](../docs/04-api-contract.md).

## Quick manual test

```bash
# upload
curl -F "file=@some.pdf" http://localhost:4000/api/documents/upload
# poll until processing_status == "completed"
curl http://localhost:4000/api/documents
# ask
curl -X POST http://localhost:4000/api/chat/ask \
  -H "Content-Type: application/json" \
  -d '{"document_id":"<id>","question":"What is this document about?"}'
```

## Layout

```
src/
  config/        env + constants
  db/            SQLite schema + repositories
  ai/            Gemini wrapper (chat + embeddings)
  modules/
    document/    upload, list, get, delete
    processing/  pdf extraction, chunking, ingestion pipeline
    embedding/   (embedding lives in ai/ + processing pipeline)
    vectorstore/ ChromaDB + in-memory fallback
    chat/        retrieval + prompt + grounded answer + citations
    summary/     document summary
  middleware/    upload (multer), error handler
  routes/        express routers
  app.js         express app
  server.js      entry point
```
